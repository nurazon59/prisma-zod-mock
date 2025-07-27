# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

prisma-zod-mockは、Prismaスキーマから型安全なモックデータを生成するためのジェネレーターです。Zodスキーマとモックファクトリーを自動生成し、セマンティックな推論によりリアルなテストデータを提供します。

## 開発コマンド

### ビルドとテスト

```bash
# TypeScriptビルド
pnpm build

# 開発モード（ウォッチ）
pnpm dev

# テスト実行
pnpm test

# テストをウォッチモードで実行
pnpm test:watch

# カバレッジ付きテスト（閾値: 80%、branches: 60%）
pnpm test:cov

# 単一テストファイルの実行
pnpm test src/generator/generatorHandler.spec.ts
```

### コード品質

```bash
# ESLintでリント
pnpm lint

# Prettierでフォーマット
pnpm format

# TypeScript型チェック
pnpm typecheck
```

## アーキテクチャ

### ディレクトリ構造

- `src/generator/`: Prismaジェネレーターのコア実装
  - `bin.ts`: CLIエントリーポイント
  - `generatorHandler.ts`: メインのジェネレーターロジック
  - `config/`: 設定パーサー（複数ファイル出力、カスタム出力パスなど）
  - `fieldWriters/`: フィールドタイプごとの書き込みロジック
  - `fileWriters/`: ファイル生成（単一/複数ファイル出力）

- `src/mock/`: モック生成ロジック
  - `core/`: モックファクトリーのコア機能
  - `generators/`: 各種データ型の値生成器
  - `semantics/`: フィールド名からの意味推論

- `src/templates/`: 生成されるコードのテンプレート
  - `mockFactory.ts`: モックファクトリーのテンプレート
  - `zodSchema.ts`: Zodスキーマのテンプレート

### 重要な設計上の特徴

1. **セマンティック推論**: フィールド名から自動的に適切なデータ型を推論
   - 例: `email`フィールド → メールアドレス生成
   - 例: `phoneNumber`フィールド → 電話番号生成

2. **フィールドレベルアノテーション**: `/// @mock`コメントで個別フィールドをカスタマイズ可能
   - `@mock faker.xxx()`: Faker.jsメソッド指定
   - `@mock "値"`: 固定値
   - `@mock.range(min, max)`: 数値範囲
   - `@mock.pattern("正規表現")`: パターンマッチ
   - `@mock.enum("選択肢1", "選択肢2")`: 列挙値

3. **複数ファイル出力サポート**: モデルごとに個別ファイル生成が可能

4. **日本語ロケール対応**: Faker.jsの日本語ロケールを使用

### テストフレームワーク

Vitestを使用。統合テストとユニットテストの両方を実装。

## 注意事項

- コード変更後は必ず`pnpm lint`と`pnpm typecheck`を実行すること
- テストカバレッジは80%以上を維持（branchesは60%以上）
- Prettierの設定に従ってフォーマットを統一すること
