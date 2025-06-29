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
import { promises as fsPromise } from "fs";
import * as path from "path";
// 自動生成された音声API型をインポート
import { components } from "../types/generated/audio";
// UseCaseクラスをインポート
import { AudioPreviewUseCase } from "../application/usecases/AudioUsecases";
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
    const domainInput =
      convertAudioPreviewApiRequestToDomainInput(previewRequest);

    // ユースケースの実行
    const domainOutput = await audioPreviewUseCase.execute(domainInput);

    // ドメイン型からAPI型に変換
    const apiResponse =
      convertAudioPreviewDomainOutputToApiResponse(domainOutput);

    return successResponse(apiResponse);
  } catch (error) {
    console.error("Error creating audio preview:", error);
    return errorResponse("Failed to create audio preview");
  }
};

/**
 * GET /stream/{filename} - 音声ファイル配信エンドポイント
 */
export const streamAudio = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const filename = event.pathParameters?.filename;

    if (!filename) {
      return badRequestResponse("Filename is required");
    }

    // tmp_output_storageフォルダからファイルを読み込み
    const filePath = path.resolve(
      process.cwd(),
      "tmp_output_storage",
      filename
    );

    try {
      // ファイルの存在確認
      await fsPromise.access(filePath);

      // ファイル内容を読み込み
      const fileContent = await fsPromise.readFile(filePath);

      // ファイル拡張子からContent-Typeを判定
      const contentType = getContentType(filename);

      return {
        statusCode: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "max-age=3600", // 1時間キャッシュ
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
        body: fileContent.toString("base64"),
        isBase64Encoded: true,
      };
    } catch (error) {
      console.error("File not found:", filePath);
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "File not found" }),
      };
    }
  } catch (error) {
    console.error("Error streaming audio file:", error);
    return errorResponse("Failed to stream audio file");
  }
};

/**
 * GET /audio/{filename} - 分離音声ファイル配信エンドポイント
 */
export const streamSeparatedAudio = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const filename = event.pathParameters?.filename;

    if (!filename) {
      return badRequestResponse("Filename is required");
    }

    // tmp_separated_audioフォルダからファイルを読み込み
    const filePath = path.resolve(
      process.cwd(),
      "tmp_separated_audio",
      filename
    );

    try {
      // ファイルの存在確認
      await fsPromise.access(filePath);

      // ファイル内容を読み込み
      const fileContent = await fsPromise.readFile(filePath);

      // ファイル拡張子からContent-Typeを判定
      const contentType = getContentType(filename);

      return {
        statusCode: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "max-age=3600", // 1時間キャッシュ
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
        body: fileContent.toString("base64"),
        isBase64Encoded: true,
      };
    } catch (error) {
      console.error("File not found:", filePath);
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "File not found" }),
      };
    }
  } catch (error) {
    console.error("Error streaming separated audio file:", error);
    return errorResponse("Failed to stream separated audio file");
  }
};

/**
 * ファイル拡張子からContent-Typeを判定
 */
function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "m3u8":
      return "application/vnd.apple.mpegurl";
    case "ts":
      return "video/mp2t";
    case "mp3":
      return "audio/mpeg";
    case "mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}
