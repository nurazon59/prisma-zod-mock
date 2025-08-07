import { z } from 'zod';
import { faker } from '@faker-js/faker';

export const UserSchema = z.object({
  id: z.string().cuid().optional(),
  email: z.string().email(),
  name: z.string().nullable(),
  age: z.number().int().nullable(),
  bio: z.string().nullable(),
  avatar: z.string().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

export const ProfileSchema = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  phoneNumber: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  zipCode: z.string().nullable(),
  birthDate: z.coerce.date().nullable(),
  website: z.string().nullable(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const PostSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  slug: z.string(),
  content: z.string().nullable(),
  published: z.boolean().optional(),
  views: z.number().int().optional(),
  authorId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date(),
  publishedAt: z.coerce.date().nullable(),
});

export type Post = z.infer<typeof PostSchema>;

export const CategorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  parentId: z.string().nullable(),
});

export type Category = z.infer<typeof CategorySchema>;

export const TagSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
});

export type Tag = z.infer<typeof TagSchema>;

export const UserSettingsSchema = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  weeklyReportEnabled: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const createUserMock = (
  overrides?: Partial<User>,
  depth: number = 0,
  maxDepth: number = 4
): User => {
  return {
    id: (() => {
      const t = Date.now().toString(36);
      const r = Math.random().toString(36).substring(2, 10);
      const c = Math.floor(Math.random() * 1000).toString(36);
      return `c${t}${r}${c}`.padEnd(25, '0').substring(0, 25);
    })(),
    email: faker.internet.email(),
    name: Math.random() > 0.5 ? faker.person.fullName() : null,
    age: Math.random() > 0.5 ? faker.number.int({ min: 18, max: 100 }) : null,
    bio: Math.random() > 0.5 ? faker.lorem.paragraph() : null,
    avatar: Math.random() > 0.5 ? faker.image.avatarGitHub() : null,
    createdAt: new Date(),
    updatedAt: faker.date.recent({ days: 30 }),
    posts:
      depth < maxDepth
        ? createPostMockBatch(faker.number.int({ min: 1, max: 3 }), {}, depth + 1, maxDepth)
        : [],
    profile:
      depth < maxDepth
        ? Math.random() > 0.5
          ? createProfileMock({}, depth + 1, maxDepth)
          : null
        : null,
    settings:
      depth < maxDepth
        ? Math.random() > 0.5
          ? createUserSettingsMock({}, depth + 1, maxDepth)
          : null
        : null,
    ...overrides,
  };
};

export const createUserMockBatch = (
  count: number = 10,
  overrides?: Partial<User>,
  depth: number = 0,
  maxDepth: number = 4
): User[] => {
  return Array.from({ length: count }, () => createUserMock(overrides, depth, maxDepth));
};

export const createValidatedUserMock = (overrides?: Partial<User>): User => {
  const mockData = createUserMock(overrides);
  return UserSchema.parse(mockData);
};

export const createProfileMock = (
  overrides?: Partial<Profile>,
  depth: number = 0,
  maxDepth: number = 4
): Profile => {
  return {
    id: (() => {
      const t = Date.now().toString(36);
      const r = Math.random().toString(36).substring(2, 10);
      const c = Math.floor(Math.random() * 1000).toString(36);
      return `c${t}${r}${c}`.padEnd(25, '0').substring(0, 25);
    })(),
    userId: faker.string.alpha(10),
    phoneNumber:
      Math.random() > 0.5 ? faker.helpers.fromRegExp('[0-9]{3}-[0-9]{4}-[0-9]{4}') : null,
    address: Math.random() > 0.5 ? faker.location.streetAddress({ useFullAddress: true }) : null,
    city: Math.random() > 0.5 ? faker.location.city() : null,
    country:
      Math.random() > 0.5
        ? faker.helpers.arrayElement(['Japan', 'USA', 'UK', 'France', 'Germany'])
        : null,
    zipCode: Math.random() > 0.5 ? faker.helpers.fromRegExp('[0-9]{3}-[0-9]{4}') : null,
    birthDate: Math.random() > 0.5 ? faker.date.birthdate({ min: 18, max: 80, mode: 'age' }) : null,
    website: Math.random() > 0.5 ? faker.internet.url() : null,
    user: depth < maxDepth ? createUserMock({}, depth + 1, maxDepth) : ({} as User),
    ...overrides,
  };
};

export const createProfileMockBatch = (
  count: number = 10,
  overrides?: Partial<Profile>,
  depth: number = 0,
  maxDepth: number = 4
): Profile[] => {
  return Array.from({ length: count }, () => createProfileMock(overrides, depth, maxDepth));
};

export const createValidatedProfileMock = (overrides?: Partial<Profile>): Profile => {
  const mockData = createProfileMock(overrides);
  return ProfileSchema.parse(mockData);
};

export const createPostMock = (
  overrides?: Partial<Post>,
  depth: number = 0,
  maxDepth: number = 4
): Post => {
  return {
    id: (() => {
      const t = Date.now().toString(36);
      const r = Math.random().toString(36).substring(2, 10);
      const c = Math.floor(Math.random() * 1000).toString(36);
      return `c${t}${r}${c}`.padEnd(25, '0').substring(0, 25);
    })(),
    title: faker.lorem.sentence({ min: 5, max: 10 }),
    slug: faker.lorem.slug(),
    content: Math.random() > 0.5 ? faker.lorem.paragraphs({ min: 3, max: 5 }) : null,
    published: faker.datatype.boolean({ probability: 0.7 }),
    views: faker.number.int({ min: 0, max: 10000 }),
    authorId: faker.string.alpha(10),
    createdAt: new Date(),
    updatedAt: faker.date.recent({ days: 30 }),
    publishedAt: Math.random() > 0.5 ? faker.date.recent({ days: 30 }) : null,
    author: depth < maxDepth ? createUserMock({}, depth + 1, maxDepth) : ({} as User),
    categories:
      depth < maxDepth
        ? createCategoryMockBatch(faker.number.int({ min: 1, max: 3 }), {}, depth + 1, maxDepth)
        : [],
    tags:
      depth < maxDepth
        ? createTagMockBatch(faker.number.int({ min: 1, max: 3 }), {}, depth + 1, maxDepth)
        : [],
    ...overrides,
  };
};

export const createPostMockBatch = (
  count: number = 10,
  overrides?: Partial<Post>,
  depth: number = 0,
  maxDepth: number = 4
): Post[] => {
  return Array.from({ length: count }, () => createPostMock(overrides, depth, maxDepth));
};

export const createValidatedPostMock = (overrides?: Partial<Post>): Post => {
  const mockData = createPostMock(overrides);
  return PostSchema.parse(mockData);
};

export const createCategoryMock = (
  overrides?: Partial<Category>,
  depth: number = 0,
  maxDepth: number = 4
): Category => {
  return {
    id: (() => {
      const t = Date.now().toString(36);
      const r = Math.random().toString(36).substring(2, 10);
      const c = Math.floor(Math.random() * 1000).toString(36);
      return `c${t}${r}${c}`.padEnd(25, '0').substring(0, 25);
    })(),
    name: faker.lorem.word(),
    slug: faker.lorem.slug(),
    description: Math.random() > 0.5 ? faker.lorem.sentence() : null,
    parentId: Math.random() > 0.5 ? faker.string.alpha(10) : null,
    posts:
      depth < maxDepth
        ? createPostMockBatch(faker.number.int({ min: 1, max: 3 }), {}, depth + 1, maxDepth)
        : [],
    parent:
      depth < maxDepth
        ? Math.random() > 0.5
          ? createCategoryMock({}, depth + 1, maxDepth)
          : null
        : null,
    children:
      depth < maxDepth
        ? createCategoryMockBatch(faker.number.int({ min: 1, max: 3 }), {}, depth + 1, maxDepth)
        : [],
    ...overrides,
  };
};

export const createCategoryMockBatch = (
  count: number = 10,
  overrides?: Partial<Category>,
  depth: number = 0,
  maxDepth: number = 4
): Category[] => {
  return Array.from({ length: count }, () => createCategoryMock(overrides, depth, maxDepth));
};

export const createValidatedCategoryMock = (overrides?: Partial<Category>): Category => {
  const mockData = createCategoryMock(overrides);
  return CategorySchema.parse(mockData);
};

export const createTagMock = (
  overrides?: Partial<Tag>,
  depth: number = 0,
  maxDepth: number = 4
): Tag => {
  return {
    id: (() => {
      const t = Date.now().toString(36);
      const r = Math.random().toString(36).substring(2, 10);
      const c = Math.floor(Math.random() * 1000).toString(36);
      return `c${t}${r}${c}`.padEnd(25, '0').substring(0, 25);
    })(),
    name: faker.word.adjective(),
    posts:
      depth < maxDepth
        ? createPostMockBatch(faker.number.int({ min: 1, max: 3 }), {}, depth + 1, maxDepth)
        : [],
    ...overrides,
  };
};

export const createTagMockBatch = (
  count: number = 10,
  overrides?: Partial<Tag>,
  depth: number = 0,
  maxDepth: number = 4
): Tag[] => {
  return Array.from({ length: count }, () => createTagMock(overrides, depth, maxDepth));
};

export const createValidatedTagMock = (overrides?: Partial<Tag>): Tag => {
  const mockData = createTagMock(overrides);
  return TagSchema.parse(mockData);
};

export const createUserSettingsMock = (
  overrides?: Partial<UserSettings>,
  depth: number = 0,
  maxDepth: number = 4
): UserSettings => {
  return {
    id: (() => {
      const t = Date.now().toString(36);
      const r = Math.random().toString(36).substring(2, 10);
      const c = Math.floor(Math.random() * 1000).toString(36);
      return `c${t}${r}${c}`.padEnd(25, '0').substring(0, 25);
    })(),
    userId: faker.string.alpha(10),
    emailNotifications: true,
    pushNotifications: false,
    language: faker.helpers.arrayElement(['ja', 'en', 'zh', 'ko']),
    timezone: 'Asia/Tokyo',
    weeklyReportEnabled: faker.datatype.boolean(),
    marketingEmails: false,
    user: depth < maxDepth ? createUserMock({}, depth + 1, maxDepth) : ({} as User),
    ...overrides,
  };
};

export const createUserSettingsMockBatch = (
  count: number = 10,
  overrides?: Partial<UserSettings>,
  depth: number = 0,
  maxDepth: number = 4
): UserSettings[] => {
  return Array.from({ length: count }, () => createUserSettingsMock(overrides, depth, maxDepth));
};

export const createValidatedUserSettingsMock = (
  overrides?: Partial<UserSettings>
): UserSettings => {
  const mockData = createUserSettingsMock(overrides);
  return UserSettingsSchema.parse(mockData);
};
