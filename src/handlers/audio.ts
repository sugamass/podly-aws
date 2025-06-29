import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import {
  successResponse,
  errorResponse,
  badRequestResponse,
} from "../utils/response";
// 自動生成された音声API型をインポート
import { components } from "../types/generated/audio";
// UseCaseクラスをインポート
import {
  AudioPreviewUseCase,
} from "../application/usecases/AudioUsecases";
// コンバーター関数をインポート
import {
  convertAudioPreviewApiRequestToDomainInput,
  convertAudioPreviewDomainOutputToApiResponse,
} from "./converter/audio";

// API schema型の型エイリアス
type AudioPreviewRequest = components["schemas"]["AudioPreviewRequest"];
type AudioPreviewResponse = components["schemas"]["AudioPreviewResponse"];

// UseCaseの初期化
const audioPreviewUseCase = new AudioPreviewUseCase();

/**
 * POST /audio/preview - 音声プレビューエンドポイント
 */
export const previewAudio = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequestResponse("Request body is required");
    }

    let previewRequest: AudioPreviewRequest;
    try {
      previewRequest = JSON.parse(event.body);
    } catch (error) {
      return badRequestResponse("Invalid JSON in request body");
    }

    // API型からドメイン型に変換
    const domainInput = convertAudioPreviewApiRequestToDomainInput(previewRequest);

    // ユースケースの実行
    const domainOutput = await audioPreviewUseCase.execute(domainInput);

    // ドメイン型からAPI型に変換
    const apiResponse = convertAudioPreviewDomainOutputToApiResponse(domainOutput);

    return successResponse(apiResponse);
  } catch (error) {
    console.error("Error creating audio preview:", error);
    return errorResponse("Failed to create audio preview");
  }
};
