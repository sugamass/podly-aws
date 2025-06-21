import {
  PostCreateScriptRequest,
  PostCreateScriptResponse,
  PromptScriptData,
} from "../../domain/script/entities/ScriptEntity";

export class CreateScriptUseCase {
  async execute(
    request: PostCreateScriptRequest
  ): Promise<PostCreateScriptResponse> {
    // 1. ドメイン固有のバリデーション
    this.validateDomainRules(request);

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
   * ドメイン固有のルール（ビジネスルール）を検証する
   */
  private validateDomainRules(request: PostCreateScriptRequest): void {
    // situationの有効値チェック（ビジネスルール）
    if (request.situation && !this.isValidSituation(request.situation)) {
      throw new Error("Invalid situation");
    }

    // その他のドメイン固有のルールがあればここに追加
    // 例：特定のキーワードの組み合わせが禁止されている、など
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
