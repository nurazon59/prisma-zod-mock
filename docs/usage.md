# 使い方

## 基本的な使い方

生成されたモックファクトリーを使用してテストデータを作成します：

```typescript
import { createUserMock } from './generated/mock';

// デフォルト値でモックを作成
const user = createUserMock();

// カスタム値でモックを作成
const customUser = createUserMock({
  name: '田中太郎',
  email: 'tanaka@example.com'
});
```

## リレーションを含むモック

```typescript
import { createUserMock, createPostMock } from './generated/mock';

// ユーザーと投稿を作成
const user = createUserMock();
const posts = Array.from({ length: 3 }, () => 
  createPostMock({ authorId: user.id })
);
```

## Zodスキーマの使用

バリデーションにZodスキーマを使用できます：

```typescript
import { UserSchema } from './generated/zod';

const userData = {
  id: '123',
  name: '田中太郎',
  email: 'tanaka@example.com'
};

// バリデーション
const validatedUser = UserSchema.parse(userData);
```

## テストでの使用例

```typescript
import { describe, it, expect } from 'vitest';
import { createUserMock } from './generated/mock';
import { userService } from './services/user';

describe('User Service', () => {
  it('should create a user', async () => {
    const mockUser = createUserMock();
    const result = await userService.create(mockUser);
    
    expect(result).toMatchObject({
      name: mockUser.name,
      email: mockUser.email
    });
  });
});
```