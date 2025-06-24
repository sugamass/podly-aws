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
// API schema型をハンドラーで直接インポート
import { components } from "../types/generated/script";
import { CreateScriptUseCase } from "../application/usecases/ScriptUsecases";
import {
  CreateScriptUseCaseInput,
  CreateScriptUseCaseOutput,
} from "../domain/script/entities/ScriptEntity";
import {
  convertApiRequestToDomainInput,
  convertDomainOutputToApiResponse,
} from "./converter/script";

// API schema型の型エイリアス
type PostCreateScriptRequest = components["schemas"]["PostCreateScriptRequest"];
type PostCreateScriptResponse =
  components["schemas"]["PostCreateScriptResponse"];

// UseCaseの初期化
const createScriptUseCase = new CreateScriptUseCase();

export const createScript = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // リクエストボディの検証
    if (!event.body) {
      return badRequestResponse("Request body is required");
    }

    let apiRequest: PostCreateScriptRequest;
    try {
      apiRequest = JSON.parse(event.body);
    } catch (error) {
      return badRequestResponse("Invalid JSON in request body");
    }

    // API型からドメイン型に変換
    const domainInput = convertApiRequestToDomainInput(apiRequest);

    // ユースケースの実行
    const domainOutput = await createScriptUseCase.execute(domainInput);

    // ドメイン型からAPI型に変換
    const apiResponse = convertDomainOutputToApiResponse(domainOutput);

    return successResponse(apiResponse);
  } catch (error) {
    console.error("Error creating script:", error);

    return errorResponse("Failed to create script");
  }
};
