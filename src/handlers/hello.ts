import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { successResponse } from "../utils/response";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("Event:", JSON.stringify(event, null, 2));
  console.log("Context:", JSON.stringify(context, null, 2));

  const message = {
    message: "Hello from Podly Lambda!",
    timestamp: new Date().toISOString(),
    stage: process.env.STAGE,
    path: event.path,
    httpMethod: event.httpMethod,
  };

  return successResponse(message);
};
