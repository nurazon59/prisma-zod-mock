import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs/promises';
import { generate } from './generator-handler';

vi.mock('fs/promises');

describe('generator-handler with relations', () => {
  const mockFs = fs as unknown as {
    mkdir: ReturnType<typeof vi.fn>;
    writeFile: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
  });

  it('should generate Zod schemas for models with relations', async () => {
    const options: Parameters<typeof generate>[0] = {
      generator: {
        name: 'prisma-zod-mock',
        provider: {
          fromEnvVar: null,
          value: 'prisma-zod-mock',
        },
        output: {
          value: './generated',
          fromEnvVar: null,
        },
        config: {},
        binaryTargets: [],
        previewFeatures: [],
        isCustomOutput: false,
        sourceFilePath: 'generator.js',
      },
      otherGenerators: [],
      schemaPath: 'schema.prisma',
      datasources: [],
      datamodel: '',
      version: '5.0.0',
      dmmf: {
        datamodel: {
          models: [
            {
              name: 'User',
              fields: [
                { name: 'id', type: 'String', kind: 'scalar', isId: true, isRequired: true, isList: false, hasDefaultValue: false },
                { name: 'email', type: 'String', kind: 'scalar', isRequired: true, isList: false, hasDefaultValue: false },
                { name: 'posts', type: 'Post', kind: 'object', isRequired: false, isList: true, hasDefaultValue: false },
                { name: 'profile', type: 'Profile', kind: 'object', isRequired: false, isList: false, hasDefaultValue: false },
              ],
            },
            {
              name: 'Post',
              fields: [
                { name: 'id', type: 'String', kind: 'scalar', isId: true, isRequired: true, isList: false, hasDefaultValue: false },
                { name: 'title', type: 'String', kind: 'scalar', isRequired: true, isList: false, hasDefaultValue: false },
                { name: 'author', type: 'User', kind: 'object', isRequired: true, isList: false, hasDefaultValue: false },
                { name: 'authorId', type: 'String', kind: 'scalar', isRequired: true, isList: false, hasDefaultValue: false },
              ],
            },
            {
              name: 'Profile',
              fields: [
                { name: 'id', type: 'String', kind: 'scalar', isId: true, isRequired: true, isList: false, hasDefaultValue: false },
                { name: 'bio', type: 'String', kind: 'scalar', isRequired: false, isList: false, hasDefaultValue: false },
                { name: 'user', type: 'User', kind: 'object', isRequired: true, isList: false, hasDefaultValue: false },
                { name: 'userId', type: 'String', kind: 'scalar', isRequired: true, isList: false, hasDefaultValue: false },
              ],
            },
          ],
          enums: [],
          indexes: [],
        },
        mappings: {
          modelOperations: [],
          otherOperations: {
            read: [],
            write: [],
          },
        },
        schema: {},
      } as any,
    };

    await generate(options);

    expect(mockFs.writeFile).toHaveBeenCalled();
    const content = mockFs.writeFile.mock.calls[0][1] as string;

    // リレーションフィールドが含まれているか確認
    expect(content).toContain('posts: z.array(PostSchema).nullable()');
    expect(content).toContain('profile: ProfileSchema.nullable()');
    expect(content).toContain('author: UserSchema');
    expect(content).toContain('user: UserSchema');

    // モックファクトリーでリレーションフィールドが処理されているか確認
    expect(content).toContain('posts: []');
    expect(content).toContain('profile: null');
    expect(content).toContain('author: { id:');
    expect(content).toContain('user: { id:');
  });

  it('should generate Zod schemas for models with enum fields', async () => {
    const options: Parameters<typeof generate>[0] = {
      generator: {
        name: 'prisma-zod-mock',
        provider: {
          fromEnvVar: null,
          value: 'prisma-zod-mock',
        },
        output: {
          value: './generated',
          fromEnvVar: null,
        },
        config: {},
        binaryTargets: [],
        previewFeatures: [],
        isCustomOutput: false,
        sourceFilePath: 'generator.js',
      },
      otherGenerators: [],
      schemaPath: 'schema.prisma',
      datasources: [],
      datamodel: '',
      version: '5.0.0',
      dmmf: {
        datamodel: {
          models: [
            {
              name: 'User',
              fields: [
                { name: 'id', type: 'String', kind: 'scalar', isId: true, isRequired: true, isList: false, hasDefaultValue: false },
                { name: 'role', type: 'Role', kind: 'enum', isRequired: true, isList: false, hasDefaultValue: false },
                { name: 'permissions', type: 'Permission', kind: 'enum', isRequired: false, isList: true, hasDefaultValue: false },
              ],
            },
          ],
          enums: [
            {
              name: 'Role',
              values: [
                { name: 'ADMIN' },
                { name: 'USER' },
                { name: 'GUEST' },
              ],
            },
            {
              name: 'Permission',
              values: [
                { name: 'READ' },
                { name: 'WRITE' },
                { name: 'DELETE' },
              ],
            },
          ],
          indexes: [],
        },
        mappings: {
          modelOperations: [],
          otherOperations: {
            read: [],
            write: [],
          },
        },
        schema: {},
      } as any,
    };

    await generate(options);

    expect(mockFs.writeFile).toHaveBeenCalled();
    const content = mockFs.writeFile.mock.calls[0][1] as string;

    // Enum定義が含まれているか確認
    expect(content).toContain('export const Role = {');
    expect(content).toContain("ADMIN: 'ADMIN'");
    expect(content).toContain("USER: 'USER'");
    expect(content).toContain("GUEST: 'GUEST'");

    // Enumフィールドが含まれているか確認
    expect(content).toContain('role: z.nativeEnum(Role)');
    expect(content).toContain('permissions: z.array(z.nativeEnum(Permission)).nullable()');

    // モックファクトリーでEnumフィールドが処理されているか確認
    expect(content).toMatch(/role: \['ADMIN', 'USER', 'GUEST'\]\[Math\.floor\(Math\.random\(\) \* 3\)\]/);
    expect(content).toContain("['READ', 'WRITE', 'DELETE']");
  });

  it('should handle multiple files mode with relations', async () => {
    const options: Parameters<typeof generate>[0] = {
      generator: {
        name: 'prisma-zod-mock',
        provider: {
          fromEnvVar: null,
          value: 'prisma-zod-mock',
        },
        output: {
          value: './generated',
          fromEnvVar: null,
        },
        config: {
          useMultipleFiles: 'true',
        },
        binaryTargets: [],
        previewFeatures: [],
        isCustomOutput: false,
        sourceFilePath: 'generator.js',
      },
      otherGenerators: [],
      schemaPath: 'schema.prisma',
      datasources: [],
      datamodel: '',
      version: '5.0.0',
      dmmf: {
        datamodel: {
          models: [
            {
              name: 'User',
              fields: [
                { name: 'id', type: 'String', kind: 'scalar', isId: true, isRequired: true, isList: false, hasDefaultValue: false },
                { name: 'posts', type: 'Post', kind: 'object', isRequired: false, isList: true, hasDefaultValue: false },
              ],
            },
            {
              name: 'Post',
              fields: [
                { name: 'id', type: 'String', kind: 'scalar', isId: true, isRequired: true, isList: false, hasDefaultValue: false },
                { name: 'author', type: 'User', kind: 'object', isRequired: true, isList: false, hasDefaultValue: false },
              ],
            },
          ],
          enums: [],
          indexes: [],
        },
        mappings: {
          modelOperations: [],
          otherOperations: {
            read: [],
            write: [],
          },
        },
        schema: {},
      } as any,
    };

    await generate(options);

    // ディレクトリ作成の確認
    expect(mockFs.mkdir).toHaveBeenCalledWith(expect.stringContaining('schemas'), { recursive: true });
    expect(mockFs.mkdir).toHaveBeenCalledWith(expect.stringContaining('mocks'), { recursive: true });

    // スキーマファイルの確認
    const schemaFiles = mockFs.writeFile.mock.calls.filter(call => call[0].includes('schemas'));
    expect(schemaFiles.length).toBe(2);

    // Userスキーマファイルの確認
    const userSchemaCall = schemaFiles.find(call => call[0].includes('user.ts'));
    const userSchemaContent = userSchemaCall?.[1] as string;
    expect(userSchemaContent).toContain("import { PostSchema } from './post'");
    expect(userSchemaContent).toContain('posts: z.array(PostSchema).nullable()');

    // Postスキーマファイルの確認
    const postSchemaCall = schemaFiles.find(call => call[0].includes('post.ts'));
    const postSchemaContent = postSchemaCall?.[1] as string;
    expect(postSchemaContent).toContain("import { UserSchema } from './user'");
    expect(postSchemaContent).toContain('author: UserSchema');
  });
});