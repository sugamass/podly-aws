import {
  AudioPreviewUseCaseInput,
  AudioPreviewUseCaseOutput,
  AudioScriptData,
  TTSProvider,
} from "../../domain/audio/entities/AudioEntity";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import { promises as fsPromise } from "fs";
import { GraphAI, GraphData } from "graphai";
import * as agents from "@graphai/agents";
import addBGMAgent from "../../agents/add_bgm_agent";
import combineFilesAgent from "../../agents/combine_files_agent";
import createDataForHlsAgent from "../../agents/create_data_for_hls_agent";
import savePostgresqlAgent from "../../agents/save_postgresql_agent";
import waitForFileAgent from "../../agents/wait_for_file_agent";
import ttsNijivoiceAgent from "../../agents/tts_nijivoice_agent";
import { ttsOpenaiAgent } from "@graphai/tts_openai_agent";
import { pathUtilsAgent } from "@graphai/vanilla_node_agents";
import customTtsOpenaiAgent from "../../agents/custom_tts_openai_agent";

// 型定義
interface ScriptData {
  speaker: string;
  text: string;
  filename?: string;
}

interface PodcastScript {
  id: string;
  tts: string;
  voices: string[];
  speakers: string[];
  script: AudioScriptData[];
  filename: string;
  voicemap: any;
  ttsAgent: string;
  padding?: any;
  imageInfo: any[];
}

type AgentFilterFunction = (context: any, next: any) => Promise<any>;

/**
 * 音声プレビューUseCase
 */
export class AudioPreviewUseCase {
  async execute(
    request: AudioPreviewUseCaseInput
  ): Promise<AudioPreviewUseCaseOutput> {
    // 音声プレビュー生成処理
    const previewResult = await this.generateAudioPreview(request);

    return previewResult;
  }

  private async generateAudioPreview(
    request: AudioPreviewUseCaseInput
  ): Promise<AudioPreviewUseCaseOutput> {
    if (!request.scriptId) {
      request.scriptId = uuidv4();
    }

    const filename = request.scriptId.replace(/-/g, "_");

    request.script.forEach((element: AudioScriptData, index: number) => {
      (element as any).filename = filename + index;
    });

    let ttsApiKey: string;

    ttsApiKey = process.env.OPENAI_API_KEY ?? "";

    let podcasterConcurrency = 8;
    let ttsAgent: string;

    request.voices = request.voices ?? ["shimmer", "echo"];
    ttsAgent = "customTtsOpenaiAgent";

    const voicemap = request.speakers?.reduce(
      (map: any, speaker: string, index: number) => {
        map[speaker] = request.voices![index];
        return map;
      },
      {}
    );

    const m3u8fileUrl =
      process.env.STORAGE_URL ??
      "http://localhost:3000/" + "stream/" + filename + ".m3u8";

    const openaiTtsModel = "gpt-4o-mini-tts"; //最新版のモデル

    const podcastScript: PodcastScript = {
      id: request.scriptId,
      tts: request.tts,
      voices: request.voices,
      speakers: request.speakers,
      script: request.script,
      filename: filename,
      voicemap: voicemap,
      ttsAgent: ttsAgent,
      padding: undefined,
      imageInfo: [],
    };

    const graphTts: GraphData = {
      nodes: {
        path: {
          agent: "pathUtilsAgent",
          params: {
            method: "resolve",
          },
          inputs: {
            dirs: ["tmp_separated_audio", "${:row.filename}.mp3"],
          },
        },
        voice: {
          agent: (namedInputs: any) => {
            const { speaker, voicemap, voice0 } = namedInputs;
            return voicemap[speaker] ?? voice0;
          },
          inputs: {
            speaker: ":row.speaker",
            voicemap: ":script.voicemap",
            voice0: ":script.voices.$0",
          },
        },
        tts: {
          agent: ":script.ttsAgent",
          inputs: {
            text: ":row.text",
            file: ":path.path",
            voice: ":voice",
          },
          params: {
            throwError: true,
            apiKey: ttsApiKey,
            model: openaiTtsModel,
            // speed: ":row.speed",
            // speed_global: ":script.speed",
          },
        },
      },
    };

    const graphPodcaster: GraphData = {
      version: 0.6,
      concurrency: podcasterConcurrency,
      nodes: {
        // script: {
        //   value: {},
        //   update: ":scriptForNest",
        // },
        map: {
          agent: "mapAgent",
          inputs: { rows: ":script.script", script: ":script" },
          graph: graphTts,
        },
        combineFiles: {
          agent: "combineFilesAgent",
          inputs: {
            map: ":map",
            script: ":script",
            outputFilePath: "scratchpad/${:script.filename}.mp3",
          },
          isResult: true,
        },
        addBGM: {
          agent: "addBGMAgent",
          params: {
            musicFileName: "music/StarsBeyondEx.mp3",
          },
          inputs: {
            voiceFile: ":combineFiles.outputFile",
            outputFilePath: "scratchpad/${:script.filename}_bgm.mp3",
            script: ":script",
          },
          isResult: true,
        },
        title: {
          agent: "copyAgent",
          params: {
            namedKey: "title",
          },
          inputs: {
            title:
              "\n${:script.title}\n\n${:script.description}\nReference: ${:script.reference}\n",
            waitFor: ":addBGM",
          },
          isResult: true,
        },
      },
    };

    const podcastGraphData: GraphData = {
      version: 0.6,
      concurrency: 8,
      nodes: {
        script: {
          value: {},
        },
        aiPodcaster: {
          agent: "nestedAgent",
          inputs: {
            script: ":script",
          },
          graph: graphPodcaster,
        },
        convertData: {
          agent: "createDataForHlsAgent",
          params: {
            outputDir:
              process.env.TS_OUTPUT_DIR ??
              path.resolve(process.cwd(), "tmp_output_storage"),
            ifDeleteInput: false,
          },
          inputs: {
            inputFilePath: ":aiPodcaster.addBGM",
            outputBaseName: ":script.filename",
          },
        },
        waitForOutput: {
          agent: "waitForFileAgent",
          params: {
            outputDir:
              process.env.TS_OUTPUT_DIR ??
              path.resolve(process.cwd(), "tmp_output_storage"),
            timeout: 5000,
          },
          inputs: { fileName: ":convertData.fileName" },
        },
        // TODO copy agentで十分
        output: {
          agent: (namedInputs: any) => {
            const { fileName, mp3Urls } = namedInputs;
            console.log("fileName:", fileName);
            console.log("mp3Urls:", mp3Urls);
            return { fileName, mp3Urls };
          },
          inputs: {
            fileName: ":convertData.fileName",
            waitfor: ":waitForOutput",
            mp3Urls: ":aiPodcaster.combineFiles.mp3Urls",
          },
          if: ":waitForOutput",
          isResult: true,
        },
      },
    };

    const fileCacheAgentFilter: AgentFilterFunction = async (context, next) => {
      const { namedInputs } = context;
      const { file } = namedInputs;
      // try {
      //   await fsPromise.access(file);
      //   console.log("cache hit: " + file, namedInputs.text.slice(0, 10));
      //
      //   return true;
      // } catch (__e) {
      //   const output = (await next(context)) as Record<string, any>;
      //   const buffer = output ? output["buffer"] : undefined;
      //   if (buffer) {
      //     console.log("writing: " + file);
      //     await fsPromise.writeFile(file, buffer);
      //     return true;
      //   }
      //   console.log("no cache, no buffer: " + file);
      //   return false;
      // }
      try {
        await fsPromise.access(file);
        console.log(
          "cache hit (will overwrite): " + file,
          namedInputs.text.slice(0, 10)
        );
        // キャッシュがあっても処理を続ける（上書き用）
      } catch {
        console.log("no cache, creating new file: " + file);
      }

      // キャッシュの有無に関係なく next を実行して buffer を取得
      const output = (await next(context)) as Record<string, any>;
      const buffer = output ? output["buffer"] : undefined;

      if (buffer) {
        console.log("writing (overwriting): " + file);
        await fsPromise.writeFile(file, buffer);
        return true;
      }

      console.log("no buffer returned: " + file);
      return false;
    };

    const agentFilters = [
      {
        name: "fileCacheAgentFilter",
        agent: fileCacheAgentFilter,
        nodeIds: ["tts"],
      },
    ];

    const podcastGraph = new GraphAI(
      podcastGraphData,
      {
        ...agents,
        ttsOpenaiAgent,
        addBGMAgent,
        combineFilesAgent,
        createDataForHlsAgent,
        waitForFileAgent,
        pathUtilsAgent,
        customTtsOpenaiAgent,
      },
      { agentFilters }
    );

    podcastGraph.injectValue("script", podcastScript);

    const graphResult = await podcastGraph.run();
    const errors = podcastGraph.errors();
    console.log("graphResult:", graphResult);

    let fileName = "";
    let mp3filenames: string[] = [];
    for (const [_, value] of Object.entries(graphResult)) {
      if (typeof value === "object" && value !== null) {
        for (const [key2, value2] of Object.entries(
          value as Record<string, any>
        )) {
          if (key2 == "fileName") {
            fileName = value2 as string;
          } else if (key2 == "mp3Urls") {
            mp3filenames = value2 as string[];
          } else {
            throw new Error("data not found");
          }
        }
      }
    }

    // 仮のプレビュー結果を返す
    const previewResult: AudioPreviewUseCaseOutput = {
      audioUrl: m3u8fileUrl,
      separatedAudioUrls: mp3filenames,
      scriptId: request.scriptId,
    };

    return previewResult;
  }
}
