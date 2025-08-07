# よくある質問 (FAQ)

## 一般的な質問

### Q: prisma-zod-mockは何をするツールですか？

A: prisma-zod-mockは、Prismaスキーマから自動的にZodスキーマとモックデータファクトリーを生成するPrismaジェネレーターです。テストデータの作成を簡単にし、型安全性を保ちながら開発効率を向上させます。

### Q: どのバージョンのPrismaに対応していますか？

A: Prisma 5.0以上に対応しています。最新バージョンの使用を推奨します。

## インストールと設定

### Q: エラー「Cannot find generator」が表示されます

A: 以下を確認してください：
1. `prisma-zod-mock`が正しくインストールされているか
2. `schema.prisma`でジェネレーターのproviderが正しく設定されているか
3. `node_modules/.bin/`にprisma-zod-mockが存在するか

### Q: 生成されたファイルが見つかりません

A: `output`パスが正しく設定されているか確認してください。相対パスは`schema.prisma`からの相対パスです。

## 使用方法

### Q: 循環参照エラーが発生します

A: `maxRelationDepth`設定を使用して、リレーションの深度を制限してください：

```prisma
generator zod {
  provider = "prisma-zod-mock"
  output   = "../src/generated"
  maxRelationDepth = 2  // デフォルトは2
}
```

### Q: 特定のフィールドに固定値を設定したい

A: `@mock`アノテーションを使用してください：

```prisma
/// @mock "固定値"
field String
```

### Q: 日本語のデータを生成したい

A: デフォルトで日本語ロケールが設定されています。他の言語に変更する場合は環境変数を使用：

```bash
PRISMA_ZOD_MOCK_LOCALE=en npx prisma generate
```

## トラブルシューティング

### Q: TypeScriptのコンパイルエラーが発生します

A: 以下を確認してください：
1. `tsconfig.json`で生成されたファイルのパスが含まれているか
2. Zodがプロジェクトにインストールされているか
3. `@faker-js/faker`がインストールされているか

### Q: モックデータが現実的でない

A: セマンティック推論を活用するか、`@mock`アノテーションで詳細に制御してください：

```prisma
model User {
  /// @mock faker.person.fullName()
  name String
  
  /// @mock faker.internet.email()
  email String
}
```

### Q: 複数ファイル出力時にインポートエラーが発生します

A: `multipleFiles = true`の場合、各ファイルが個別に生成されます。インポートパスを確認してください：

```typescript
// 単一ファイルの場合
import { createUserMock } from './generated/mock';

// 複数ファイルの場合
import { createUserMock } from './generated/mock/User';
```

## パフォーマンス

### Q: 生成が遅い

A: 大規模なスキーマの場合、以下を試してください：
1. 不要なモデルを一時的にコメントアウト
2. `multipleFiles = true`で並列処理を活用
3. リレーションの深度を制限

### Q: メモリ使用量が多い

A: 大量のモックデータを生成する場合は、バッチ処理を検討してください：

```typescript
// 良い例：バッチ処理
for (let i = 0; i < 1000; i += 100) {
  const batch = Array.from({ length: 100 }, createUserMock);
  await processBatch(batch);
}

// 悪い例：一度に全て生成
const allUsers = Array.from({ length: 1000 }, createUserMock);
```

## その他

### Q: コントリビュートしたい

A: GitHubリポジトリでIssueやPull Requestを歓迎しています：
https://github.com/nurazon59/prisma-zod-mock

### Q: ライセンスは？

A: MITライセンスです。商用利用も可能です。

### Q: サポートが必要です

A: 以下の方法でサポートを受けられます：
1. GitHub Issuesで質問
2. ドキュメントを確認
3. サンプルコードを参照