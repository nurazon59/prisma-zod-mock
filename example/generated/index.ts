import { z } from 'zod';
import { faker } from '@faker-js/faker';

// ===== Zod Schemas =====
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
});

export type Profile = z.infer<typeof ProfileSchema>;

export const PostSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  content: z.string().nullable(),
  published: z.boolean().optional(),
  authorId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date(),
});

export type Post = z.infer<typeof PostSchema>;

export const CategorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

// ===== Mock Factories =====
export const createUserMock = (overrides?: Partial<User>): User => {
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

export const createUserMockBatch = (
  count: number = 10,
  overrides?: Partial<User>
): User[] => {
  return Array.from({ length: count }, () => createUserMock(overrides));
};

export const createValidatedUserMock = (overrides?: Partial<User>): User => {
  const mockData = createUserMock(overrides);
  return UserSchema.parse(mockData);
};

export const createProfileMock = (overrides?: Partial<Profile>): Profile => {
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

export const createProfileMockBatch = (
  count: number = 10,
  overrides?: Partial<Profile>
): Profile[] => {
  return Array.from({ length: count }, () => createProfileMock(overrides));
};

export const createValidatedProfileMock = (overrides?: Partial<Profile>): Profile => {
  const mockData = createProfileMock(overrides);
  return ProfileSchema.parse(mockData);
};

export const createPostMock = (overrides?: Partial<Post>): Post => {
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

export const createPostMockBatch = (
  count: number = 10,
  overrides?: Partial<Post>
): Post[] => {
  return Array.from({ length: count }, () => createPostMock(overrides));
};

export const createValidatedPostMock = (overrides?: Partial<Post>): Post => {
  const mockData = createPostMock(overrides);
  return PostSchema.parse(mockData);
};

export const createCategoryMock = (overrides?: Partial<Category>): Category => {
  return {
    id: faker.string.nanoid(),
    name: faker.person.fullName(),
    ...overrides
  };
};

export const createCategoryMockBatch = (
  count: number = 10,
  overrides?: Partial<Category>
): Category[] => {
  return Array.from({ length: count }, () => createCategoryMock(overrides));
};

export const createValidatedCategoryMock = (overrides?: Partial<Category>): Category => {
  const mockData = createCategoryMock(overrides);
  return CategorySchema.parse(mockData);
};

