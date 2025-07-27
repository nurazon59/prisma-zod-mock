import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generate } from '../src/generator/generator-handler';

const TEST_OUTPUT_DIR = path.join(__dirname, 'temp-output-relations');

describe('Integration Tests with Relations', () => {
  beforeEach(async () => {
    await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  });

  afterEach(async () => {
    await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  });

  it('should generate correct output for schema with relations', async () => {
    const options = {
      generator: {
        output: { value: TEST_OUTPUT_DIR },
        config: {},
      },
      dmmf: {
        datamodel: {
          models: [
            {
              name: 'User',
              fields: [
                {
                  name: 'id',
                  type: 'String',
                  kind: 'scalar',
                  isId: true,
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: true,
                  default: { name: 'cuid' },
                },
                {
                  name: 'email',
                  type: 'String',
                  kind: 'scalar',
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: false,
                  isUnique: true,
                },
                {
                  name: 'name',
                  type: 'String',
                  kind: 'scalar',
                  isRequired: false,
                  isList: false,
                  hasDefaultValue: false,
                },
                {
                  name: 'posts',
                  type: 'Post',
                  kind: 'object',
                  isRequired: false,
                  isList: true,
                  hasDefaultValue: false,
                  relationName: 'UserToPost',
                },
                {
                  name: 'profile',
                  type: 'Profile',
                  kind: 'object',
                  isRequired: false,
                  isList: false,
                  hasDefaultValue: false,
                  relationName: 'UserToProfile',
                },
                {
                  name: 'role',
                  type: 'Role',
                  kind: 'enum',
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: true,
                  default: 'USER',
                },
              ],
            },
            {
              name: 'Post',
              fields: [
                {
                  name: 'id',
                  type: 'String',
                  kind: 'scalar',
                  isId: true,
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: true,
                  default: { name: 'cuid' },
                },
                {
                  name: 'title',
                  type: 'String',
                  kind: 'scalar',
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: false,
                },
                {
                  name: 'content',
                  type: 'String',
                  kind: 'scalar',
                  isRequired: false,
                  isList: false,
                  hasDefaultValue: false,
                },
                {
                  name: 'published',
                  type: 'Boolean',
                  kind: 'scalar',
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: true,
                  default: false,
                },
                {
                  name: 'author',
                  type: 'User',
                  kind: 'object',
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: false,
                  relationName: 'UserToPost',
                },
                {
                  name: 'authorId',
                  type: 'String',
                  kind: 'scalar',
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: false,
                },
                {
                  name: 'tags',
                  type: 'Tag',
                  kind: 'enum',
                  isRequired: false,
                  isList: true,
                  hasDefaultValue: false,
                },
              ],
            },
            {
              name: 'Profile',
              fields: [
                {
                  name: 'id',
                  type: 'String',
                  kind: 'scalar',
                  isId: true,
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: true,
                  default: { name: 'cuid' },
                },
                {
                  name: 'bio',
                  type: 'String',
                  kind: 'scalar',
                  isRequired: false,
                  isList: false,
                  hasDefaultValue: false,
                },
                {
                  name: 'user',
                  type: 'User',
                  kind: 'object',
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: false,
                  relationName: 'UserToProfile',
                },
                {
                  name: 'userId',
                  type: 'String',
                  kind: 'scalar',
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: false,
                  isUnique: true,
                },
              ],
            },
          ],
          enums: [
            {
              name: 'Role',
              values: [
                { name: 'ADMIN' },
                { name: 'USER' },
                { name: 'MODERATOR' },
              ],
            },
            {
              name: 'Tag',
              values: [
                { name: 'TECH' },
                { name: 'LIFESTYLE' },
                { name: 'TRAVEL' },
                { name: 'FOOD' },
              ],
            },
          ],
        },
      },
    } as any;

    await generate(options);

    const outputPath = path.join(TEST_OUTPUT_DIR, 'index.ts');
    const content = await fs.readFile(outputPath, 'utf-8');

    // Enum定義の確認
    expect(content).toContain('export const Role = {');
    expect(content).toContain("ADMIN: 'ADMIN'");
    expect(content).toContain("USER: 'USER'");
    expect(content).toContain("MODERATOR: 'MODERATOR'");
    expect(content).toContain('export type Role = typeof Role[keyof typeof Role];');

    expect(content).toContain('export const Tag = {');
    expect(content).toContain("TECH: 'TECH'");
    expect(content).toContain("LIFESTYLE: 'LIFESTYLE'");

    // Zodスキーマの確認
    expect(content).toContain('export const UserSchema = z.object({');
    expect(content).toContain('id: z.string().cuid().optional()');
    expect(content).toContain('email: z.string().email()');
    expect(content).toContain('name: z.string().nullable()');
    expect(content).toContain('posts: z.array(PostSchema).nullable()');
    expect(content).toContain('profile: ProfileSchema.nullable()');
    expect(content).toContain('role: z.nativeEnum(Role).optional()');

    expect(content).toContain('export const PostSchema = z.object({');
    expect(content).toContain('title: z.string()');
    expect(content).toContain('author: UserSchema');
    expect(content).toContain('tags: z.array(z.nativeEnum(Tag)).nullable()');

    expect(content).toContain('export const ProfileSchema = z.object({');
    expect(content).toContain('bio: z.string().nullable()');
    expect(content).toContain('user: UserSchema');

    // モックファクトリーの確認
    expect(content).toContain('export const createUserMock = (overrides?: Partial<User>): User => {');
    expect(content).toContain('posts: []');
    expect(content).toContain('profile: null');
    expect(content).toMatch(/role: \['ADMIN', 'USER', 'MODERATOR'\]\[Math\.floor\(Math\.random\(\) \* 3\)\]/);

    expect(content).toContain('export const createPostMock = (overrides?: Partial<Post>): Post => {');
    expect(content).toContain('author: { id: faker.string.nanoid() }');
    expect(content).toMatch(/tags: \['TECH', 'LIFESTYLE', 'TRAVEL', 'FOOD'\]/);

    expect(content).toContain('export const createProfileMock = (overrides?: Partial<Profile>): Profile => {');
    expect(content).toContain('user: { id: faker.string.nanoid() }');

  });

  it('should handle circular references properly', async () => {
    const options = {
      generator: {
        output: { value: TEST_OUTPUT_DIR },
        config: {},
      },
      dmmf: {
        datamodel: {
          models: [
            {
              name: 'Category',
              fields: [
                {
                  name: 'id',
                  type: 'String',
                  kind: 'scalar',
                  isId: true,
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: true,
                  default: { name: 'cuid' },
                },
                {
                  name: 'name',
                  type: 'String',
                  kind: 'scalar',
                  isRequired: true,
                  isList: false,
                  hasDefaultValue: false,
                },
                {
                  name: 'parent',
                  type: 'Category',
                  kind: 'object',
                  isRequired: false,
                  isList: false,
                  hasDefaultValue: false,
                },
                {
                  name: 'parentId',
                  type: 'String',
                  kind: 'scalar',
                  isRequired: false,
                  isList: false,
                  hasDefaultValue: false,
                },
                {
                  name: 'children',
                  type: 'Category',
                  kind: 'object',
                  isRequired: false,
                  isList: true,
                  hasDefaultValue: false,
                },
              ],
            },
          ],
          enums: [],
        },
      },
    } as any;

    await generate(options);

    const outputPath = path.join(TEST_OUTPUT_DIR, 'index.ts');
    const content = await fs.readFile(outputPath, 'utf-8');

    // 自己参照のスキーマとモックが正しく生成されているか確認
    expect(content).toContain('parent: CategorySchema.nullable()');
    expect(content).toContain('children: z.array(CategorySchema).nullable()');
    expect(content).toContain('parent: null');
    expect(content).toContain('children: []');
  });
});