# 設定

## ジェネレーター設定

`schema.prisma`でジェネレーターを設定できます：

```prisma
generator zod {
  provider = "prisma-zod-mock"
  output   = "../src/generated"
  
  // 複数ファイル出力
  multipleFiles = true
  
  // カスタム出力パス
  zodOutputPath = "../src/zod"
  mockOutputPath = "../src/mock"
  
  // リレーションの深度制限
  maxRelationDepth = 3
}
```

## 設定オプション

### `output` (必須)
生成されたファイルの出力先ディレクトリ。

### `multipleFiles` (オプション)
`true`に設定すると、モデルごとに個別のファイルを生成します。

```
generated/
├── zod/
│   ├── User.ts
│   ├── Post.ts
│   └── index.ts
└── mock/
    ├── User.ts
    ├── Post.ts
    └── index.ts
```

### `zodOutputPath` / `mockOutputPath` (オプション)
Zodスキーマとモックファクトリーのカスタム出力パスを指定できます。

### `maxRelationDepth` (オプション)
リレーションのネスト深度を制限します（デフォルト: 2）。循環参照を防ぎます。

## 環境変数

### `PRISMA_ZOD_MOCK_LOCALE`
Faker.jsのロケールを設定します（デフォルト: `ja`）。

```bash
PRISMA_ZOD_MOCK_LOCALE=en npx prisma generate
```

利用可能なロケール：
- `ja` - 日本語
- `en` - 英語
- `de` - ドイツ語
- `fr` - フランス語
- その他のFaker.jsがサポートするロケール