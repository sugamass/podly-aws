import {
  CreateScriptUseCaseInput,
  CreateScriptUseCaseOutput,
} from "../../domain/script/entities/ScriptEntity";
import { PostCreateScriptRequest, PostCreateScriptResponse } from "../../types";

// API型からドメイン型への変換関数
export function convertApiRequestToDomainInput(
  apiRequest: PostCreateScriptRequest
): CreateScriptUseCaseInput {
  return {
    prompt: apiRequest.prompt,
    previousScript: apiRequest.previousScript,
    reference: apiRequest.reference,
    isSearch: apiRequest.isSearch,
    wordCount: apiRequest.wordCount,
    situation: apiRequest.situation,
    speakers: undefined, // API schemaにはspeakersがないので、必要に応じて後で追加
  };
}

// ドメイン型からAPI型への変換関数
export function convertDomainOutputToApiResponse(
  domainOutput: CreateScriptUseCaseOutput
): PostCreateScriptResponse {
  return {
    newScript: domainOutput.newScript,
    previousScript: domainOutput.previousScript,
  };
}
