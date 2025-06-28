import {
  CreateScriptUseCaseInput,
  CreateScriptUseCaseOutput,
  PromptScriptData,
  Reference,
} from "../../domain/script/entities/ScriptEntity";
import { GraphAI, GraphData } from "graphai";
import * as agents from "@graphai/agents";
import { schoolPrompt } from "./SystemPrompts";
import customOpenaiAgent from "../../utils/agents/openaiAgent";
import openaiResponsesAgent from "../../utils/agents/openaiResponsesAgent";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export class CreateScriptUseCase {
  async execute(
    request: CreateScriptUseCaseInput
  ): Promise<CreateScriptUseCaseOutput> {
    // ドメイン固有のバリデーション
    this.validateDomainRules(request);

    // 2. 新しいスクリプトを生成
    const newScript = await this.generateScript(request);

    // 3. レスポンスを構築
    const response: CreateScriptUseCaseOutput = {
      newScript: newScript,
      previousScript: request.previousScript || [],
    };

    return response;
  }

  /**
   * ドメイン固有のルール（ビジネスルール）を検証する
   */
  private validateDomainRules(request: CreateScriptUseCaseInput): void {
    // situationの有効値チェック（ビジネスルール）
    if (request.situation && !this.isValidSituation(request.situation)) {
      throw new Error("Invalid situation");
    }

    // promptが必須
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }

    // その他のドメイン固有のルールがあればここに追加
    // 例：特定のキーワードの組み合わせが禁止されている、など
  }

  /**
   * 新しいスクリプトを生成する
   */
  private async generateScript(
    request: CreateScriptUseCaseInput
  ): Promise<PromptScriptData> {
    // const tavilyApiKey = process.env.TAVILY_API_KEY;

    const messages = [{ role: "system", content: schoolPrompt }];

    const messagesForResponses = schoolPrompt + "webから情報を集めて。";

    // if (request.isSearch) {
    //   messages.push({
    //     role: "system",
    //     content: "参照元のURLは本文に含めないでください。",
    //   });
    // }

    // 4-oは文字数タスク苦手で、文字数指定はまだ難しそうなので保留。
    // if (request.wordCount) {
    //   const wordCountMessage = `台本の文字数は、${request.wordCount}文字程度にしてください。`;
    //   messages.push({ role: "system", content: wordCountMessage });
    // }

    if (request.previousScript) {
      request.previousScript.forEach((s) => {
        messages.push({ role: "user", content: s.prompt });
        messages.push({ role: "assistant", content: JSON.stringify(s.script) });
      });
    }

    const webSearchOptions = {
      user_location: {
        type: "approximate",
        approximate: {
          country: "JP",
        },
      },
      search_context_size: "medium",
    };

    const webSearchOptionsForResponses = {
      user_location: {
        type: "approximate",
        country: "JP",
      },
      search_context_size: "medium",
    };

    const zScriptFormat = z.object({
      speaker: z.string(),
      text: z.string(),
    });

    const podcastJsonFormat = z.object({
      scripts: z.array(zScriptFormat),
    });

    const createScriptGraph: GraphData = {
      version: 2.0,
      nodes: {
        isSearch: {
          value: {},
        },
        promptInput: {
          value: {},
        },
        messages: {
          value: {},
        },
        messagesForResponses: {
          value: {},
        },
        searchMessage: {
          value: {},
        },
        reference: {
          value: {},
        },
        referenceCheck: {
          agent: (namedInputs) => {
            const { reference } = namedInputs;
            return reference.length > 0;
          },
          inputs: { reference: ":reference" },
        },
        searchCheck: {
          agent: (namedInputs) => {
            const { isSearch } = namedInputs;
            return isSearch;
          },
          inputs: { isSearch: ":isSearch" },
          unless: ":referenceCheck",
        },
        llm: {
          agent: "customOpenaiAgent",
          params: {
            model: "gpt-4.1",
            apiKey: process.env.OPENAI_API_KEY,
            response_format: zodResponseFormat(podcastJsonFormat, "podcast"),
          },
          inputs: {
            messages: ":messages",
            prompt: ":promptInput",
          },
          unless: ":isSearch",
        },
        searchLlm: {
          agent: "customOpenaiAgent",
          params: {
            model: "gpt-4o-search-preview",
            web_search_options: webSearchOptions,
            apiKey: process.env.OPENAI_API_KEY,
            response_format: zodResponseFormat(podcastJsonFormat, "podcast"),
          },
          inputs: {
            messages: ":messages",
            prompt: ":promptInput",
          },
          if: ":isSearch",
        },
        // searchLlm: {
        //   agent: "openaiResponsesAgent",
        //   params: {
        //     model: "gpt-4.1",
        //     tools: [
        //       { type: "web_search_preview", ...webSearchOptionsForResponses },
        //     ],
        //     apiKey: process.env.OPENAI_API_KEY,
        //   },
        //   inputs: {
        //     instructions: ":messagesForResponses",
        //     input: ":promptInput",
        //   },
        //   if: ":isSearch",
        // },
        output: {
          agent: "copyAgent",
          anyInput: true,
          inputs: {
            array: [":llm.text", ":searchLlm.text"],
          },
          isResult: true,
        },
        // urlArrayOutput: {
        //   agent: (namedInputs) => {
        //     const { url } = namedInputs;
        //     console.log("url:", url);
        //     return url;
        //   },
        //   // inputs: { url: ":searchLlm.choices.$0.message.annotations" },
        //   inputs: { url: ":searchLlm.choices" },
        //   isResult: true,
        //   if: ":searchCheck",
        // },
        urlArrayOutput: {
          agent: "copyAgent",
          inputs: { url: ":searchLlm.choices.$0.message.annotations" },
          isResult: true,
          if: ":searchCheck",
        },
      },
    };

    const graphAI = new GraphAI(createScriptGraph, {
      ...agents,
      customOpenaiAgent,
    });
    graphAI.injectValue("promptInput", request.prompt);
    graphAI.injectValue("isSearch", request.isSearch);
    graphAI.injectValue("messages", messages);
    graphAI.injectValue("messagesForResponses", messagesForResponses);
    // graphAI.injectValue("searchMessage", searchMessages);
    graphAI.injectValue("reference", request?.reference ?? []);

    const result = await graphAI.run();

    console.log("resulttttttttt:", result);

    let generatedScriptString = "";
    let urlArrayOutput = [];
    for (const [_, value] of Object.entries(result)) {
      if (typeof value === "object") {
        for (const [key2, value2] of Object.entries(value)) {
          if (key2 == "array") {
            generatedScriptString = value2[0];
          } else if (key2 == "url") {
            urlArrayOutput = value2;
          } else {
            throw new Error("data is required");
          }
        }
      }
    }

    let outputReference: Reference[] = [];
    if (urlArrayOutput?.length > 0) {
      outputReference = urlArrayOutput.map((urlCitation: any) => ({
        url: urlCitation.url,
        title: urlCitation.title,
        startIndex: urlCitation.startIndex,
        endIndex: urlCitation.endIndex,
      }));
    } else if (request.reference && request.reference.length > 0) {
      outputReference = request.reference.map((reference: any) => ({
        url: reference.url,
      }));
    }

    return {
      prompt: request.prompt,
      script: JSON.parse(generatedScriptString),
      reference: outputReference || [],
      situation: request.situation,
    };
  }

  private isValidSituation(situation: string): boolean {
    const validSituations = [
      "school",
      "expert",
      "interview",
      "friends",
      "radio_personality",
    ];
    return validSituations.includes(situation);
  }
}
