# Prisma Zod Mock Example

prisma-zod-mockの動作確認用サンプルです。

## 使い方

```bash
# 1. 依存関係をインストール
pnpm install

# 2. コード生成を実行
pnpm generate
```

## 確認

`pnpm generate`を実行すると、`generated/index.ts`にZodスキーマとモックファクトリーが生成されます。

## ファイル

- `schema.prisma` - サンプルのPrismaスキーマ
- `generated/` - 自動生成されるディレクトリ（.gitignoreで除外）
