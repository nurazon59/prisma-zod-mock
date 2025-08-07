# 高度な例

## ECサイトのデータモデル

### Prismaスキーマ

```prisma
model Customer {
  id            String   @id @default(uuid())
  /// @mock faker.person.fullName()
  name          String
  /// @mock faker.internet.email()
  email         String   @unique
  /// @mock faker.phone.number('0##-####-####')
  phoneNumber   String
  /// @mock.enum("premium", "regular", "new")
  customerType  String   @default("new")
  orders        Order[]
  addresses     Address[]
  createdAt     DateTime @default(now())
}

model Address {
  id           String   @id @default(uuid())
  /// @mock faker.location.streetAddress()
  street       String
  /// @mock faker.location.city()
  city         String
  /// @mock.enum("東京都", "大阪府", "愛知県", "福岡県", "北海道")
  prefecture   String
  /// @mock.pattern("[0-9]{3}-[0-9]{4}")
  postalCode   String
  customer     Customer @relation(fields: [customerId], references: [id])
  customerId   String
  /// @mock faker.datatype.boolean()
  isDefault    Boolean  @default(false)
}

model Product {
  id           String   @id @default(uuid())
  /// @mock faker.commerce.productName()
  name         String
  /// @mock faker.commerce.productDescription()
  description  String
  /// @mock.range(100, 50000)
  price        Float
  /// @mock.range(0, 1000)
  stock        Int
  /// @mock.pattern("SKU-[A-Z]{3}-[0-9]{4}")
  sku          String   @unique
  /// @mock faker.image.url()
  imageUrl     String
  orderItems   OrderItem[]
  categories   Category[]
}

model Category {
  id          String   @id @default(uuid())
  /// @mock.enum("電化製品", "ファッション", "食品", "書籍", "スポーツ")
  name        String   @unique
  /// @mock faker.lorem.sentence()
  description String?
  products    Product[]
}

model Order {
  id          String      @id @default(uuid())
  /// @mock.pattern("ORD-[0-9]{8}")
  orderNumber String      @unique
  customer    Customer    @relation(fields: [customerId], references: [id])
  customerId  String
  orderItems  OrderItem[]
  /// @mock.enum("pending", "processing", "shipped", "delivered", "cancelled")
  status      String      @default("pending")
  /// @mock.range(100, 100000)
  totalAmount Float
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(uuid())
  order     Order   @relation(fields: [orderId], references: [id])
  orderId   String
  product   Product @relation(fields: [productId], references: [id])
  productId String
  /// @mock.range(1, 10)
  quantity  Int
  /// @mock.range(100, 50000)
  price     Float
}
```

### 複雑なテストシナリオ

```typescript
import {
  createCustomerMock,
  createProductMock,
  createOrderMock,
  createOrderItemMock,
  createAddressMock,
  createCategoryMock,
} from '../generated/mock';

// テストシナリオ：プレミアム顧客の大量注文
export function createPremiumCustomerScenario() {
  // プレミアム顧客を作成
  const customer = createCustomerMock({
    customerType: 'premium',
    name: '山田花子',
    email: 'yamada@example.com',
  });

  // 複数の配送先住所を作成
  const addresses = [
    createAddressMock({
      customerId: customer.id,
      isDefault: true,
      prefecture: '東京都',
      city: '渋谷区',
    }),
    createAddressMock({
      customerId: customer.id,
      isDefault: false,
      prefecture: '大阪府',
      city: '大阪市',
    }),
  ];

  // カテゴリと商品を作成
  const electronics = createCategoryMock({ name: '電化製品' });
  const products = Array.from({ length: 10 }, () =>
    createProductMock({
      price: Math.floor(Math.random() * 50000) + 10000,
      stock: Math.floor(Math.random() * 100) + 10,
    })
  );

  // 注文を作成
  const order = createOrderMock({
    customerId: customer.id,
    status: 'processing',
    totalAmount: 0, // 後で計算
  });

  // 注文アイテムを作成
  const orderItems = products.slice(0, 5).map((product) => {
    const quantity = Math.floor(Math.random() * 5) + 1;
    return createOrderItemMock({
      orderId: order.id,
      productId: product.id,
      quantity,
      price: product.price,
    });
  });

  // 合計金額を計算
  order.totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    customer,
    addresses,
    products,
    order,
    orderItems,
    categories: [electronics],
  };
}
```

### データベースシーディング

```typescript
import { PrismaClient } from '@prisma/client';
import { createPremiumCustomerScenario } from './scenarios';

const prisma = new PrismaClient();

async function seed() {
  // 既存データをクリア
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // シナリオを10個作成
  for (let i = 0; i < 10; i++) {
    const scenario = createPremiumCustomerScenario();

    // 顧客を作成
    await prisma.customer.create({
      data: {
        ...scenario.customer,
        addresses: {
          create: scenario.addresses.map((addr) => ({
            street: addr.street,
            city: addr.city,
            prefecture: addr.prefecture,
            postalCode: addr.postalCode,
            isDefault: addr.isDefault,
          })),
        },
      },
    });

    // カテゴリと商品を作成
    for (const category of scenario.categories) {
      await prisma.category.create({
        data: {
          ...category,
          products: {
            create: scenario.products.map((product) => ({
              name: product.name,
              description: product.description,
              price: product.price,
              stock: product.stock,
              sku: product.sku,
              imageUrl: product.imageUrl,
            })),
          },
        },
      });
    }

    // 注文を作成
    await prisma.order.create({
      data: {
        ...scenario.order,
        orderItems: {
          create: scenario.orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }

  console.log('✅ データベースのシーディングが完了しました');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```
