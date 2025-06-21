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
import { PostCreateScriptRequest } from "../domain/script/entities/ScriptEntity";
import { CreateScriptUseCase } from "../application/usecases/ScriptUsecases";

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

    let request: PostCreateScriptRequest;
    try {
      request = JSON.parse(event.body);
    } catch (error) {
      return badRequestResponse("Invalid JSON in request body");
    }

    // ユースケースの実行
    const response = await createScriptUseCase.execute(request);

    return successResponse(response);
  } catch (error) {
    console.error("Error creating script:", error);

    // ドメインエラーの場合はBad Requestを返す
    if (
      (error instanceof Error && error.message.includes("required")) ||
      (error instanceof Error && error.message.includes("Invalid"))
    ) {
      return badRequestResponse(error.message);
    }

    return errorResponse("Failed to create script");
  }
};
