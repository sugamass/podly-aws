import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse,
} from "../utils/response";
import { PodcastRequest, Podcast } from "../types/api";

// インメモリストレージ（本番環境ではDynamoDBなどを使用）
const podcasts: Podcast[] = [];

export const createPodcast = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequestResponse("Request body is required");
    }

    const request: PodcastRequest = JSON.parse(event.body);

    if (!request.title || !request.description || !request.category) {
      return badRequestResponse(
        "title, description, and category are required"
      );
    }

    const newPodcast: Podcast = {
      id: Math.random().toString(36).substr(2, 9),
      title: request.title,
      description: request.description,
      category: request.category,
      duration: request.duration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    podcasts.push(newPodcast);

    return successResponse(newPodcast);
  } catch (error) {
    console.error("Error creating podcast:", error);
    return errorResponse("Failed to create podcast");
  }
};

export const getPodcast = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const podcastId = event.pathParameters?.id;

    if (!podcastId) {
      return badRequestResponse("Podcast ID is required");
    }

    const podcast = podcasts.find((p) => p.id === podcastId);

    if (!podcast) {
      return notFoundResponse("Podcast not found");
    }

    return successResponse(podcast);
  } catch (error) {
    console.error("Error getting podcast:", error);
    return errorResponse("Failed to get podcast");
  }
};

export const listPodcasts = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { category } = event.queryStringParameters || {};

    let filteredPodcasts = [...podcasts];

    if (category) {
      filteredPodcasts = podcasts.filter((p) => p.category === category);
    }

    return successResponse({
      podcasts: filteredPodcasts,
      count: filteredPodcasts.length,
    });
  } catch (error) {
    console.error("Error listing podcasts:", error);
    return errorResponse("Failed to list podcasts");
  }
};
