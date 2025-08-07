# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-08-06

### Added

- リレーションネスト深度制御機能
  - グローバル深度設定: `relationDepth`でリレーション生成の深さを制御
  - モデル別深度設定: `modelDepths`で特定モデルごとに深度をカスタマイズ
  - 循環参照の自動検出と防止
- CI/CDパイプライン (GitHub Actions)
  - ESLint、Prettier、TypeScript型チェック
  - Node.js 18/20/22でのテスト実行
  - カバレッジレポート生成
  - ビルド検証

### Changed

- リレーション生成ロジックを深度制御対応に改良
- テストカバレッジを拡充

### Documentation

- 英語版README追加
- 日本語版READMEの改善
- 深度制御機能のドキュメント追加

## [0.1.0] - 2024-06-01

### Added

- 初回リリース
- Prismaスキーマからのzodスキーマ自動生成
- モックファクトリーの自動生成
- セマンティック推論によるリアルなデータ生成
- フィールドレベルアノテーション (`@mock`)
- 日本語ロケール対応
- 単一ファイル/複数ファイル出力サポート
