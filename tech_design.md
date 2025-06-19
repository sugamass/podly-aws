## 🔧 バックエンド構成

### Supabase（常時稼働・軽量な処理向け）

- **認証**：Email/Password、Google ログインなどの SNS 連携
- **データベース**：PostgreSQL（原稿、音声メタ情報、ユーザーデータを管理）
- **ストレージ**：軽量な画像などの保存用
- **リアルタイム機能**：いいね・保存などの即時反映
- **Edge Functions**：軽量 API や Webhook の実装に使用（処理時間制限あり）

### AWS（生成処理・スケーラブルな処理向け）

- **API Gateway + AWS Lambda（TypeScript）**：
  - Web 検索を活用した原稿生成（LLM + Web 検索 Agent）
  - 指定 URL からの要約・原稿生成
  - TTS（Text-to-Speech）による音声生成
  - Serverless Framework を用いてローカル開発・デプロイを効率化
- **S3**：生成した音声ファイルの保存
- **CloudFront**：音声ファイルの CDN 配信（ストリーミング対応可）

---

## ☁️ インフラ / サーバー構成

- **モバイルアプリ（フロントエンド）**：
  - React Native + Expo
  - EAS Build / Submit により iOS・Android アプリを簡単にストア公開
- **インフラ管理（IaC）**：
  - Terraform による Supabase・AWS リソースの構築と管理（再現性・保守性 ◎）
- **データ管理**：
  - ユーザー・ポッドキャストメタ情報などは Supabase PostgreSQL に集約
- **認証**：
  - Supabase Auth による統一管理（簡易なセキュリティ設定が可能）
- **音声ストレージ**：
  - AWS S3 をメインに使用（コスト効率・スケーラビリティ・Lambda 連携の良さ）
- **音声配信**：
  - CloudFront によるグローバル CDN 配信（低レイテンシで再生可能）

## 議論

- Edge Functions（supabase 公式の API 機能）には最大３０秒のタイムアウト制限
- **Row Level Security + DB Trigger で非同期処理は不可に近い**
  - バックグラウンド処理は向いていない
