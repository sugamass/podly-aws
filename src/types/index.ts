// 既存の手動定義型
export interface ApiResponse<T = any> {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export interface PodcastRequest {
  title: string;
  description: string;
  category: string;
  duration?: number;
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  category: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

// 生成された型をインポートして再エクスポート
export type {
  paths as AudioPaths,
  components as AudioComponents,
  operations as AudioOperations,
} from "./generated/audio";
export type {
  paths as ScriptPaths,
  components as ScriptComponents,
  operations as ScriptOperations,
} from "./generated/script";

// 生成された型ファイルからimport
import type { components as AudioComp } from "./generated/audio";
import type { components as ScriptComp } from "./generated/script";
import type { paths as AudioPath } from "./generated/audio";
import type { paths as ScriptPath } from "./generated/script";
import type { operations as AudioOps } from "./generated/audio";
import type { operations as ScriptOps } from "./generated/script";

// 便利な型エイリアス（生成された型から抽出）
export type AudioData = AudioComp["schemas"]["AudioData"];
export type PostAudioRequest = AudioComp["schemas"]["PostAudioForRequest"];
export type AudioTestRequest = AudioComp["schemas"]["AudioTestRequest"];
export type AudioTestResponse = AudioComp["schemas"]["AudioTestResponse"];
export type PostNewAudioRequest = AudioComp["schemas"]["PostNewAudioRequest"];

export type ScriptData = ScriptComp["schemas"]["ScriptData"];
export type PostCreateScriptRequest =
  ScriptComp["schemas"]["PostCreateScriptRequest"];
export type PostCreateScriptResponse =
  ScriptComp["schemas"]["PostCreateScriptResponse"];
export type PromptScriptData = ScriptComp["schemas"]["PromptScriptData"];

// API パスの型
export type AudioCreatePath = AudioPath["/audio"]["post"];
export type AudioListPath = AudioPath["/audio"]["get"];
export type AudioTestPath = AudioPath["/audio/test"]["post"];
export type AudioNewPath = AudioPath["/audio/new"]["post"];
export type AudioDeletePath = AudioPath["/audio/new"]["delete"];

export type ScriptCreatePath = ScriptPath["/script/create"]["post"];

// API オペレーション型
export type GetAudioOperation = AudioOps["get-audio"];
export type PostAudioOperation = AudioOps["post-audio"];
export type PostAudioTestOperation = AudioOps["post-audio-test"];
export type PostAudioNewOperation = AudioOps["post-audio-new"];
export type DeleteAudioNewOperation = AudioOps["delete-audio-new"];

export type PostScriptCreateOperation = ScriptOps["post-script-create"];
