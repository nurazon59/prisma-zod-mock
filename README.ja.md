# Prisma Zod Mock

[![CI](https://github.com/itsuki54/prisma-zod-mock/actions/workflows/ci.yml/badge.svg)](https://github.com/itsuki54/prisma-zod-mock/actions/workflows/ci.yml)
[![Documentation](https://github.com/itsuki54/prisma-zod-mock/actions/workflows/docs.yml/badge.svg)](https://github.com/itsuki54/prisma-zod-mock/actions/workflows/docs.yml)
[![npm version](https://badge.fury.io/js/prisma-zod-mock.svg)](https://badge.fury.io/js/prisma-zod-mock)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
  email: 'alice@example.com',
});

// Zodスキーマでのバリデーション
const validatedUser = UserSchema.parse(customUser);

// バッチ生成
const users = createUserMockBatch(10);
```

## 設定オプション

| オプション            | デフォルト | 説明                                   |
| --------------------- | ---------- | -------------------------------------- |
| `createZodSchemas`    | `true`     | Zodスキーマを生成するか                |
| `createMockFactories` | `true`     | モックファクトリーを生成するか         |
| `useMultipleFiles`    | `false`    | 複数ファイルに分割して出力するか       |
| `writeBarrelFiles`    | `true`     | バレルファイル（index.ts）を生成するか |
| `mockDataLocale`      | `"en"`     | Faker.jsのロケール設定                 |
| `mockDateRange`       | `30`       | 日付生成の範囲（日数）                 |
| `createRelationMocks` | `true`     | リレーション付きモックを生成するか     |

## フィールドレベルアノテーション

`@mock`アノテーションを使用して、各フィールドのモック生成ロジックをカスタマイズできます。

### 値生成の優先順位

prisma-zod-mockは以下の優先順位で値を生成します：

1. **@mockアノテーション** - 最優先
2. **Prismaデフォルト値** - `@default("USER")`や`@default(true)`など
3. **セマンティック推論** - フィールド名から自動判定

### 基本的な使い方

```prisma
model User {
  // Fakerのメソッドを直接指定
  email     String   @unique /// @mock faker.internet.email()
  name      String?  /// @mock faker.person.fullName()

  // 固定値
  role      String   @default("USER") /// @mock "USER"
  isActive  Boolean  /// @mock true

  // 数値の範囲指定
  age       Int?     /// @mock.range(18, 100)
  score     Float    /// @mock.range(0.0, 100.0)

  // 正規表現パターン
  code      String   /// @mock.pattern("[A-Z]{3}-[0-9]{4}")
  phone     String?  /// @mock.pattern("[0-9]{3}-[0-9]{4}-[0-9]{4}")

  // 選択肢からランダムに選択
  country   String   /// @mock.enum("Japan", "USA", "UK", "France")
  status    String   /// @mock.enum("active", "inactive", "pending")
}
```

### デフォルト値の活用

Prismaの`@default`属性が設定されている場合、モックでも同じ値を使用します：

```prisma
model Settings {
  // @defaultの値がモックでも使用される
  emailNotifications  Boolean  @default(true)   // モック: true
  theme              String   @default("light") // モック: 'light'
  maxRetries         Int      @default(3)       // モック: 3

  // @mockアノテーションがある場合はそちらを優先
  language           String   @default("en") /// @mock "ja"  // モック: "ja"
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
