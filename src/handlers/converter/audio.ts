import {
  AudioPreviewUseCaseInput,
  AudioPreviewUseCaseOutput,
  AudioScriptData,
} from "../../domain/audio/entities/AudioEntity";
import { components } from "../../types/generated/audio";

// API schema型の型エイリアス
type AudioPreviewRequest = components["schemas"]["AudioPreviewRequest"];
type AudioPreviewResponse = components["schemas"]["AudioPreviewResponse"];
type ScriptData = components["schemas"]["ScriptData"];

// AudioPreview: API型からドメイン型への変換関数
export function convertAudioPreviewApiRequestToDomainInput(
  apiRequest: AudioPreviewRequest
): AudioPreviewUseCaseInput {
  return {
    script: convertApiScriptDataToDomainScriptData(apiRequest.script),
    tts: apiRequest.tts,
    voices: apiRequest.voices,
    speakers: apiRequest.speakers,
    scriptId: apiRequest.scriptId ?? "",
  };
}

// AudioPreview: ドメイン型からAPI型への変換関数
export function convertAudioPreviewDomainOutputToApiResponse(
  domainOutput: AudioPreviewUseCaseOutput
): AudioPreviewResponse {
  return {
    audioUrl: domainOutput.audioUrl,
    separatedAudioUrls: domainOutput.separatedAudioUrls,
    scriptId: domainOutput.scriptId,
  };
}

// ヘルパー関数: API ScriptData[] から ドメイン AudioScriptData[] への変換
function convertApiScriptDataToDomainScriptData(
  apiScriptData: ScriptData[]
): AudioScriptData[] {
  return apiScriptData.map((item) => ({
    speaker: item.speaker,
    text: item.text,
    caption: item.caption,
  }));
}
