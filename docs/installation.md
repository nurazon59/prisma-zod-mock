# インストール

## 必要要件

- Node.js 18以上
- Prisma 5.0以上

## パッケージのインストール

```bash
npm install -D prisma-zod-mock
```

または

```bash
pnpm add -D prisma-zod-mock
```

## Prismaスキーマの設定

`schema.prisma`ファイルにジェネレーターを追加します：

```prisma
generator zod {
  provider = "prisma-zod-mock"
  output   = "../src/generated"
}
```

## 生成

```bash
npx prisma generate
```

これにより、以下のファイルが生成されます：

- `src/generated/zod/index.ts` - Zodスキーマ
- `src/generated/mock/index.ts` - モックファクトリー
