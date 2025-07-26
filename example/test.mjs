// TypeScriptで生成されたコードを直接実行するため、内容をコピー
import { z } from 'zod';
import { faker } from '@faker-js/faker';

// Zodスキーマ
const UserSchema = z.object({
  id: z.string().cuid().optional(),
  email: z.string().email(),
  name: z.string().nullable(),
  age: z.number().int().nullable(),
  bio: z.string().nullable(),
  avatar: z.string().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date(),
});

// モックファクトリー
const createUserMock = (overrides) => {
  return {
    id: faker.string.nanoid(),
    email: faker.internet.email(),
    name: Math.random() > 0.5 ? faker.person.fullName() : null,
    age: Math.random() > 0.5 ? faker.number.int({ min: 1, max: 1000 }) : null,
    bio: Math.random() > 0.5 ? faker.lorem.paragraph() : null,
    avatar: Math.random() > 0.5 ? faker.image.url() : null,
    createdAt: new Date(),
    updatedAt: faker.date.recent({ days: 30 }),
    ...overrides
  };
};

const createUserMockBatch = (count = 10, overrides) => {
  return Array.from({ length: count }, () => createUserMock(overrides));
};

const createProfileMock = (overrides) => {
  return {
    id: faker.string.nanoid(),
    userId: faker.string.alpha(10),
    phoneNumber: Math.random() > 0.5 ? faker.phone.number() : null,
    address: Math.random() > 0.5 ? faker.location.streetAddress() : null,
    city: Math.random() > 0.5 ? faker.location.city() : null,
    country: Math.random() > 0.5 ? faker.location.country() : null,
    zipCode: Math.random() > 0.5 ? faker.location.zipCode() : null,
    ...overrides
  };
};

const createPostMock = (overrides) => {
  return {
    id: faker.string.nanoid(),
    title: faker.lorem.sentence(),
    content: Math.random() > 0.5 ? faker.string.alpha(10) : null,
    published: faker.datatype.boolean(),
    authorId: faker.string.alpha(10),
    createdAt: new Date(),
    updatedAt: faker.date.recent({ days: 30 }),
    ...overrides
  };
};

console.log('🚀 Prisma Zod Mock - Example Test\n');

// 1. 基本的なモック生成
console.log('📝 基本的なユーザーモック:');
const user = createUserMock();
console.log({
  id: user.id,
  email: user.email,
  name: user.name,
  age: user.age
});

// 2. セマンティック推論のテスト
console.log('\n🎯 セマンティック推論の確認:');
const profile = createProfileMock();
console.log({
  phoneNumber: profile.phoneNumber, // 電話番号形式
  address: profile.address,          // 住所形式
  city: profile.city,                // 都市名
  country: profile.country,          // 国名
  zipCode: profile.zipCode           // 郵便番号
});

// 3. カスタマイズ
console.log('\n🎨 カスタマイズされたモック:');
const customUser = createUserMock({
  name: '山田太郎',
  email: 'yamada@example.jp',
  age: 30,
  bio: 'こんにちは！'
});
console.log(customUser);

// 4. バッチ生成
console.log('\n📦 バッチ生成（3人のユーザー）:');
const users = createUserMockBatch(3);
users.forEach((u, i) => {
  console.log(`  ${i + 1}. ${u.email} - ${u.name || '(名前なし)'}`);
});

// 5. リレーションのあるデータ
console.log('\n🔗 リレーションを持つ投稿:');
const post = createPostMock({
  title: 'Prisma Zod Mockの紹介',
  authorId: user.id,
  published: true
});
console.log({
  title: post.title,
  authorId: post.authorId,
  published: post.published
});

// 6. バリデーション
console.log('\n✅ Zodバリデーション:');
try {
  const validatedUser = UserSchema.parse(customUser);
  console.log('  バリデーション成功！');
} catch (error) {
  console.log('  バリデーションエラー:', error.issues);
}

console.log('\n🎉 テスト完了！');