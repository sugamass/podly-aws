# Script API 実装

## 概要

`/script/create` API をクリーンアーキテクチャで実装しました。

## アーキテクチャ構成

### Domain 層 (`src/domain/`)

- **ScriptEntity** (`src/domain/script/entities/ScriptEntity.ts`)
  - OpenAPI 型定義のみ

### Application 層 (`src/application/`)

- **CreateScriptUseCase** (`src/application/usecases/ScriptUsecases.ts`)
  - スクリプト作成のビジネスロジック（バリデーション、スクリプト生成）
  - **実装部分は現在コメントアウト済み**

### Infrastructure 層 (`src/infrastructure/`)

- 現在はリポジトリ実装なし（必要に応じて DynamoDB リポジトリなどを追加可能）

### Presentation 層 (`src/handlers/`)

- **script.ts** (`src/handlers/script.ts`)
  - AWS Lambda ハンドラー

## API 仕様

### エンドポイント

```
POST /script/create
```

### リクエスト

```json
{
  "prompt": "string (required)",
  "previousScript": [
    {
      "prompt": "string",
      "script": [
        {
          "speaker": "string",
          "text": "string",
          "caption": "string"
        }
      ],
      "reference": ["string"],
      "situation": "string"
    }
  ],
  "reference": ["string"],
  "isSearch": boolean,
  "wordCount": number,
  "situation": "school" | "expert" | "interview" | "friends" | "radio_personality"
}
```

### レスポンス

```json
{
  "newScript": {
    "prompt": "string",
    "script": [
      {
        "speaker": "string",
        "text": "string",
        "caption": "string"
      }
    ],
    "reference": ["string"],
    "situation": "string"
  },
  "previousScript": [
    // 同じ構造
  ]
}
```

## 実装済み機能

- ✅ リクエストのバリデーション
- ✅ エラーハンドリング
- ✅ レスポンス形式
- ✅ Serverless Framework 設定

## アーキテクチャの設計判断

### なぜ UseCase に統合したのか？

初期実装では `CreateScriptUseCase`（Application 層）と `ScriptDomainService`（Domain 層）の両方にビジネスロジックが存在し、冗長でした：

- **Before**: UseCase → DomainService（薄いラッパー）
- **After**: UseCase に統合（シンプル）

現在のスクリプト生成機能は単一のユースケースのため、複雑なドメインロジックの分離は不要と判断し、Application 層の UseCase に統合しました。

## TODO (実装が必要な部分)

- 🔄 スクリプト生成ロジック (`CreateScriptUseCase.generateScript`)
  - OpenAI API / Claude API 連携
  - プロンプト解析
  - 参考資料検索機能
  - 状況別トーン調整
  - 文字数制御

## デプロイ・実行

### ローカル開発

```bash
npm install
npm run dev
```

### デプロイ

```bash
npm run deploy
```

### テスト例

```bash
curl -X POST http://localhost:3000/script/create \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "ポッドキャストの台本を作成してください",
    "situation": "friends",
    "wordCount": 500
  }'
```
