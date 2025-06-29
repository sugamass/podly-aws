// ドメイン固有の型定義（API schemaから独立）
export interface AudioScriptData {
  speaker: string;
  text: string;
  caption: string;
}

// AudioPreview UseCaseの入力・出力型
export interface AudioPreviewUseCaseInput {
  script: AudioScriptData[];
  tts: string;
  voices: string[];
  speakers: string[];
  scriptId: string;
}

export interface AudioPreviewUseCaseOutput {
  audioUrl?: string;
  separatedAudioUrls?: string[];
  scriptId?: string;
}

// TTSプロバイダー型
export type TTSProvider = "openai" | "elevenlabs" | "azure" | "google";
