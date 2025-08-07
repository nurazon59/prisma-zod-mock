import { describe, it, expect } from 'vitest';
import { generate } from '../src/generator/generator-handler';
import { GeneratorOptions } from '@prisma/generator-helper';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('モデル別深度テスト', () => {
  it('異なるモデルに異なる深度を適用する', async () => {
    const outputDir = path.join(__dirname, 'temp-output-model-depths');

    const options: GeneratorOptions = {
      generator: {
        name: 'prisma-zod-mock',
        provider: {
          fromEnvVar: null,
          value: 'prisma-zod-mock',
        },
        output: {
          value: outputDir,
          fromEnvVar: null,
        },
        config: {
          createZodSchemas: 'true',
          createMockFactories: 'true',
          createRelationMocks: 'true',
          relationMaxDepth: '4', // グローバルデフォルト
          modelDepths: '{"User": 2, "Post": 3, "Category": 1}', // モデル別設定
        },
        binaryTargets: [],
        previewFeatures: [],
        isCustomOutput: false,
        sourceFilePath: 'generator.js',
      },
      dmmf: {
        datamodel: {
          enums: [],
          indexes: [],
          types: [],
          models: [
            {
              name: 'User',
              dbName: null,
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: true,
                  default: { name: 'cuid', args: [] },
                },
                {
                  name: 'posts',
                  kind: 'object',
                  isList: true,
                  isRequired: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'Post',
                  hasDefaultValue: false,
                },
              ],
              primaryKey: null,
              uniqueFields: [],
              uniqueIndexes: [],
            },
            {
              name: 'Post',
              dbName: null,
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: true,
                  default: { name: 'cuid', args: [] },
                },
                {
                  name: 'author',
                  kind: 'object',
                  isList: false,
                  isRequired: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'User',
                  hasDefaultValue: false,
                },
                {
                  name: 'category',
                  kind: 'object',
                  isList: false,
                  isRequired: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'Category',
                  hasDefaultValue: false,
                },
              ],
              primaryKey: null,
              uniqueFields: [],
              uniqueIndexes: [],
            },
            {
              name: 'Category',
              dbName: null,
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: true,
                  default: { name: 'cuid', args: [] },
                },
                {
                  name: 'posts',
                  kind: 'object',
                  isList: true,
                  isRequired: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'Post',
                  hasDefaultValue: false,
                },
              ],
              primaryKey: null,
              uniqueFields: [],
              uniqueIndexes: [],
            },
            {
              name: 'Comment',
              dbName: null,
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: true,
                  default: { name: 'cuid', args: [] },
                },
                {
                  name: 'content',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: false,
                },
              ],
              primaryKey: null,
              uniqueFields: [],
              uniqueIndexes: [],
            },
          ],
        },
        schema: {
          inputObjectTypes: {
            prisma: [],
            model: undefined,
          },
          outputObjectTypes: {
            prisma: [],
            model: [],
          },
          enumTypes: {
            prisma: [],
            model: undefined,
          },
          fieldRefTypes: {
            prisma: undefined,
          },
        },
        mappings: {
          modelOperations: [],
          otherOperations: {
            read: [],
            write: [],
          },
        },
      },
      otherGenerators: [],
      schemaPath: 'schema.prisma',
      version: '5.0.0',
      datasources: [],
      datamodel: '',
    };

    await generate(options);

    const indexContent = await fs.readFile(path.join(outputDir, 'index.ts'), 'utf-8');

    // Userモデルは深度2
    expect(indexContent).toMatch(/createUserMock[\s\S]*?maxDepth: number = 2/);

    // Postモデルは深度3
    expect(indexContent).toMatch(/createPostMock[\s\S]*?maxDepth: number = 3/);

    // Categoryモデルは深度1
    expect(indexContent).toMatch(/createCategoryMock[\s\S]*?maxDepth: number = 1/);

    // Commentモデルはリレーションがないので、グローバル設定は適用されない（深度パラメータなし）
    expect(indexContent).toContain('createCommentMock = (overrides?: Partial<Comment>): Comment');

    await fs.rm(outputDir, { recursive: true, force: true });
  });

  it('モデルが指定されていない場合はグローバル深度にフォールバックする', async () => {
    const outputDir = path.join(__dirname, 'temp-output-fallback-depth');

    const options: GeneratorOptions = {
      generator: {
        name: 'prisma-zod-mock',
        provider: {
          fromEnvVar: null,
          value: 'prisma-zod-mock',
        },
        output: {
          value: outputDir,
          fromEnvVar: null,
        },
        config: {
          createZodSchemas: 'true',
          createMockFactories: 'true',
          createRelationMocks: 'true',
          relationMaxDepth: '5', // グローバル設定
          modelDepths: '{"User": 2}', // Userのみ指定
        },
        binaryTargets: [],
        previewFeatures: [],
        isCustomOutput: false,
        sourceFilePath: 'generator.js',
      },
      dmmf: {
        datamodel: {
          enums: [],
          indexes: [],
          types: [],
          models: [
            {
              name: 'User',
              dbName: null,
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: true,
                  default: { name: 'cuid', args: [] },
                },
                {
                  name: 'posts',
                  kind: 'object',
                  isList: true,
                  isRequired: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'Post',
                  hasDefaultValue: false,
                },
              ],
              primaryKey: null,
              uniqueFields: [],
              uniqueIndexes: [],
            },
            {
              name: 'Post',
              dbName: null,
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: true,
                  default: { name: 'cuid', args: [] },
                },
                {
                  name: 'author',
                  kind: 'object',
                  isList: false,
                  isRequired: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'User',
                  hasDefaultValue: false,
                },
              ],
              primaryKey: null,
              uniqueFields: [],
              uniqueIndexes: [],
            },
          ],
        },
        schema: {
          inputObjectTypes: {
            prisma: [],
            model: undefined,
          },
          outputObjectTypes: {
            prisma: [],
            model: [],
          },
          enumTypes: {
            prisma: [],
            model: undefined,
          },
          fieldRefTypes: {
            prisma: undefined,
          },
        },
        mappings: {
          modelOperations: [],
          otherOperations: {
            read: [],
            write: [],
          },
        },
      },
      otherGenerators: [],
      schemaPath: 'schema.prisma',
      version: '5.0.0',
      datasources: [],
      datamodel: '',
    };

    await generate(options);

    const indexContent = await fs.readFile(path.join(outputDir, 'index.ts'), 'utf-8');

    // Userは指定された深度2
    expect(indexContent).toMatch(/createUserMock[\s\S]*?maxDepth: number = 2/);

    // Postは未指定なのでグローバルの深度5
    expect(indexContent).toMatch(/createPostMock[\s\S]*?maxDepth: number = 5/);

    await fs.rm(outputDir, { recursive: true, force: true });
  });
});
