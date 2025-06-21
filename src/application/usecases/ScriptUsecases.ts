import {
  PostCreateScriptRequest,
  PostCreateScriptResponse,
  PromptScriptData,
} from "../../domain/script/entities/ScriptEntity";

export class CreateScriptUseCase {
  async execute(
    request: PostCreateScriptRequest
  ): Promise<PostCreateScriptResponse> {
    // 1. リクエストの検証
    this.validateCreateScriptRequest(request);

    // 2. 新しいスクリプトを生成
    const newScript = await this.generateScript(request);

    // 3. レスポンスを構築
    const response: PostCreateScriptResponse = {
      newScript: newScript,
      previousScript: request.previousScript || [],
    };

    return response;
  }

  /**
   * スクリプト作成の入力を検証する
   */
  private validateCreateScriptRequest(request: PostCreateScriptRequest): void {
    if (!request.prompt || request.prompt.trim() === "") {
      throw new Error("Prompt is required");
    }

    if (request.wordCount && request.wordCount <= 0) {
      throw new Error("Word count must be positive");
    }

    if (request.situation && !this.isValidSituation(request.situation)) {
      throw new Error("Invalid situation");
    }
  }

  /**
   * 新しいスクリプトを生成する（実装は後で）
   */
  private async generateScript(
    request: PostCreateScriptRequest
  ): Promise<PromptScriptData> {
    // TODO: ここに実際のスクリプト生成ロジックを実装
    // 現在はダミーデータを返す

    /*
    // 実際の実装例：
    // 1. プロンプトを解析
    // 2. 参考資料を検索（isSearchがtrueの場合）
    // 3. 前回のスクリプトを考慮
    // 4. 指定された状況に応じてトーンを調整
    // 5. 指定された文字数に合わせて生成
    // 6. OpenAI APIやClaude APIを使用してスクリプトを生成
    */

    return {
      prompt: request.prompt,
      script: [
        {
          speaker: "Host",
          text: "Generated script content would go here...",
          caption: "Generated from prompt",
        },
      ],
      reference: request.reference || [],
      situation: request.situation || "friends",
    };
  }

  private isValidSituation(situation: string): boolean {
    const validSituations = [
      "school",
      "expert",
      "interview",
      "friends",
      "radio_personality",
    ];
    return validSituations.includes(situation);
  }
}
