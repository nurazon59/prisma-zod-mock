# アノテーション

`@mock`アノテーションを使用して、フィールドレベルでモックデータの生成をカスタマイズできます。

## 基本的な使い方

```prisma
model User {
  id        String   @id @default(uuid())
  /// @mock faker.person.fullName()
  name      String
  /// @mock faker.internet.email()
  email     String   @unique
  /// @mock faker.datatype.number({ min: 18, max: 100 })
  age       Int
  createdAt DateTime @default(now())
}
```

## アノテーションの種類

### `@mock faker.*`

Faker.jsのメソッドを直接指定します。

```prisma
/// @mock faker.person.firstName()
firstName String

/// @mock faker.address.city()
city String

/// @mock faker.lorem.paragraph()
bio String
```

### `@mock "固定値"`

固定値を設定します。

```prisma
/// @mock "ACTIVE"
status String

/// @mock "Japan"
country String
```

### `@mock.range(min, max)`

数値の範囲を指定します。

```prisma
/// @mock.range(0, 100)
score Int

/// @mock.range(1000, 10000)
price Float
```

### `@mock.pattern("正規表現")`

正規表現パターンに従った値を生成します。

```prisma
/// @mock.pattern("[A-Z]{3}-[0-9]{4}")
code String  // 例: ABC-1234

/// @mock.pattern("0[789]0-[0-9]{4}-[0-9]{4}")
phone String // 例: 080-1234-5678
```

### `@mock.enum("値1", "値2", ...)`

指定した値からランダムに選択します。

```prisma
/// @mock.enum("red", "green", "blue")
color String

/// @mock.enum("small", "medium", "large")
size String
```

### `@mock.length(min, max)`

文字列の長さを指定します。

```prisma
/// @mock.length(10, 20)
description String

/// @mock.length(8, 8)
password String
```

## 高度な使用例

### 複数のアノテーションの組み合わせ

```prisma
model Product {
  id          String   @id @default(uuid())

  /// @mock faker.commerce.productName()
  name        String

  /// @mock faker.commerce.productDescription()
  /// @mock.length(50, 200)
  description String

  /// @mock.range(100, 10000)
  price       Float

  /// @mock.enum("available", "out_of_stock", "discontinued")
  status      String

  /// @mock.pattern("SKU-[A-Z]{3}-[0-9]{4}")
  sku         String   @unique
}
```

### 日本語データの生成

```prisma
model JapaneseUser {
  id            String   @id @default(uuid())

  /// @mock faker.person.lastName() + " " + faker.person.firstName()
  fullName      String

  /// @mock faker.location.city() + "市"
  city          String

  /// @mock.pattern("〒[0-9]{3}-[0-9]{4}")
  postalCode    String

  /// @mock.enum("東京都", "大阪府", "愛知県", "福岡県")
  prefecture    String
}
```

## セマンティック推論

アノテーションを指定しない場合、フィールド名から自動的に適切なデータ型を推論します：

- `email` → メールアドレス
- `phone` / `phoneNumber` → 電話番号
- `firstName` / `lastName` → 名前
- `address` → 住所
- `url` / `website` → URL
- `password` → パスワード
- `avatar` / `image` → 画像URL
- `price` / `amount` → 金額
- `date` / `birthday` → 日付

```prisma
model User {
  id          String   @id @default(uuid())
  email       String   // 自動的にメールアドレスを生成
  phoneNumber String   // 自動的に電話番号を生成
  firstName   String   // 自動的に名を生成
  lastName    String   // 自動的に姓を生成
  avatar      String   // 自動的にアバターURLを生成
}
```
