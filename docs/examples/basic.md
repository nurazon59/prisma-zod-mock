# 基本的な例

## シンプルなブログアプリケーション

### Prismaスキーマ

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

generator zod {
  provider = "prisma-zod-mock"
  output   = "../src/generated"
}

model User {
  id        String   @id @default(uuid())
  /// @mock faker.person.fullName()
  name      String
  /// @mock faker.internet.email()
  email     String   @unique
  /// @mock faker.internet.password()
  password  String
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(uuid())
  /// @mock faker.lorem.sentence()
  title     String
  /// @mock faker.lorem.paragraphs(3)
  content   String
  /// @mock faker.datatype.boolean()
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  tags      Tag[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Tag {
  id    String @id @default(uuid())
  /// @mock faker.lorem.word()
  name  String @unique
  posts Post[]
}
```

### 生成されたモックの使用

```typescript
import { 
  createUserMock, 
  createPostMock, 
  createTagMock 
} from '../generated/mock';

// ユーザーを作成
const user = createUserMock({
  name: '田中太郎',
  email: 'tanaka@example.com'
});

// ユーザーの投稿を作成
const posts = Array.from({ length: 5 }, () => 
  createPostMock({
    authorId: user.id,
    published: Math.random() > 0.5
  })
);

// タグを作成
const tags = ['TypeScript', 'React', 'Prisma'].map(name =>
  createTagMock({ name })
);
```

### テストでの使用

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { createUserMock, createPostMock } from '../generated/mock';

const prisma = new PrismaClient();

describe('Blog Service', () => {
  beforeEach(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create a user with posts', async () => {
    const mockUser = createUserMock();
    const user = await prisma.user.create({
      data: mockUser
    });

    const mockPosts = Array.from({ length: 3 }, () => 
      createPostMock({ authorId: user.id })
    );

    const posts = await prisma.post.createMany({
      data: mockPosts
    });

    const userWithPosts = await prisma.user.findUnique({
      where: { id: user.id },
      include: { posts: true }
    });

    expect(userWithPosts?.posts).toHaveLength(3);
  });
});
```