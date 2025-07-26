# Prisma Zod Mock

PrismaスキーマからZodバリデーションスキーマとモックデータファクトリーを自動生成する統合ライブラリです。

## 特徴

- 🚀 Prismaスキーマから自動的にZodスキーマを生成
- 🎯 型安全なモックデータファクトリーの自動生成
- 🧠 フィールド名からのセマンティック推論による現実的なデータ生成
- 🔗 リレーションを考慮した一貫性のあるデータ生成
- ⚡ zod-prisma-types互換のオプション

## インストール

```bash
npm install --save-dev prisma-zod-mock
# または
yarn add -D prisma-zod-mock
# または
pnpm add -D prisma-zod-mock
```

## 使用方法

### 1. Prismaスキーマに設定を追加

```prisma
generator zodMock {
  provider                = "prisma-zod-mock"
  output                 = "./generated"
  
  // オプション設定
  createZodSchemas       = true
  createMockFactories    = true
  useMultipleFiles       = false
  mockDataLocale        = "ja"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}
```

### 2. 生成の実行

```bash
npx prisma generate
```

### 3. 生成されたコードの使用

```typescript
import { createUserMock, UserSchema } from './generated';

// 単一のモックデータ生成
const user = createUserMock();
console.log(user);
// {
//   id: 'clh3k4n5j0000qw8w5h3k4n5j',
//   email: 'test@example.com',
//   name: 'John Doe',
//   createdAt: 2024-01-01T00:00:00.000Z
// }

// カスタマイズしたモックデータ
const customUser = createUserMock({
  name: 'Alice Smith',
  email: 'alice@example.com'
});

// Zodスキーマでのバリデーション
const validatedUser = UserSchema.parse(customUser);

// バッチ生成
const users = createUserMockBatch(10);
```

## 設定オプション

| オプション | デフォルト | 説明 |
|-----------|-----------|------|
| `createZodSchemas` | `true` | Zodスキーマを生成するか |
| `createMockFactories` | `true` | モックファクトリーを生成するか |
| `useMultipleFiles` | `false` | 複数ファイルに分割して出力するか |
| `writeBarrelFiles` | `true` | バレルファイル（index.ts）を生成するか |
| `mockDataLocale` | `"en"` | Faker.jsのロケール設定 |
| `mockDateRange` | `30` | 日付生成の範囲（日数） |
| `createRelationMocks` | `true` | リレーション付きモックを生成するか |

## フィールドレベルアノテーション

```prisma
model User {
  // 特定のモック生成ロジックを指定
  id        String   @id /// @mock.use(() => faker.string.uuid())
  
  // セマンティックタイプを明示
  email     String   @unique /// @mock.semantic("email")
  
  // 数値範囲の指定
  age       Int?     /// @mock.range(18, 80)
  
  // 日付範囲の指定
  birthDate DateTime /// @mock.between("1950-01-01", "2005-12-31")
  
  // 配列の長さ指定
  tags      String[] /// @mock.arrayLength(1, 5)
  
  // 固定値
  status    String   @default("active") /// @mock.fixed("active")
  
  // モック生成から除外
  password  String   /// @mock.omit()
}
```

## セマンティック推論

フィールド名から自動的にデータタイプを推測します：

- `email`, `mail` → メールアドレス
- `name`, `firstName`, `lastName` → 人名
- `phone`, `tel`, `mobile` → 電話番号
- `address`, `street`, `city`, `zip` → 住所
- `url`, `website`, `link` → URL
- `description`, `bio`, `about` → 説明文
- `title`, `heading`, `subject` → タイトル
- `date`, `createdAt`, `updatedAt` → 日付
- `image`, `avatar`, `photo` → 画像URL
- `price`, `cost`, `amount` → 価格
- `country` → 国名
- `company`, `organization` → 会社名

## 開発

```bash
# 依存関係のインストール
pnpm install

# テストの実行
pnpm test

# ビルド
pnpm build

# 開発モード
pnpm dev
```

## ライセンス

MIT