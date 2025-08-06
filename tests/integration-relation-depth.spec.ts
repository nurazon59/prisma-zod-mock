import { describe, it, expect } from 'vitest';
import { generate } from '../src/generator/generator-handler';
import { GeneratorOptions } from '@prisma/generator-helper';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Relation Depth Tests', () => {
  it('should generate mock factories with default depth of 4', async () => {
    const outputDir = path.join(__dirname, 'temp-output-depth');

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
                  name: 'name',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: false,
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
                  relationName: 'UserToPosts',
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
                  name: 'title',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: false,
                },
                {
                  name: 'author',
                  kind: 'object',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'User',
                  hasDefaultValue: false,
                  relationName: 'UserToPosts',
                },
                {
                  name: 'comments',
                  kind: 'object',
                  isList: true,
                  isRequired: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'Comment',
                  hasDefaultValue: false,
                  relationName: 'PostToComments',
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
                {
                  name: 'post',
                  kind: 'object',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'Post',
                  hasDefaultValue: false,
                  relationName: 'PostToComments',
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

    // デフォルトの深度4でファクトリーが生成されることを確認
    expect(indexContent).toContain('maxDepth: number = 4');
    expect(indexContent).toContain('depth < maxDepth');
    expect(indexContent).toContain('depth + 1, maxDepth');

    // リレーションを持つモデルに深度パラメータがあることを確認
    expect(indexContent).toContain('createUserMock = (');
    expect(indexContent).toContain('depth: number = 0');
    expect(indexContent).toContain('createPostMock = (');
    expect(indexContent).toContain('createCommentMock = (');

    // バッチ関数も深度パラメータを持つことを確認
    expect(indexContent).toContain('createUserMockBatch = (');
    expect(indexContent).toContain('createPostMockBatch = (');
    expect(indexContent).toContain('createCommentMockBatch = (');

    await fs.rm(outputDir, { recursive: true, force: true });
  });

  it('should use custom relationMaxDepth when configured', async () => {
    const outputDir = path.join(__dirname, 'temp-output-custom-depth');

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
          relationMaxDepth: '2', // カスタム深度を設定
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

    // カスタム深度2が使用されることを確認
    expect(indexContent).toContain('maxDepth: number = 2');

    await fs.rm(outputDir, { recursive: true, force: true });
  });

  it('should support @mock.relationDepth annotation', async () => {
    const outputDir = path.join(__dirname, 'temp-output-annotation-depth');

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
                  documentation: '@mock.relationDepth(2)', // カスタム深度アノテーション
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

    // アノテーションによるカスタム深度が使用されることを確認
    expect(indexContent).toContain('Math.min(maxDepth, 2)');

    await fs.rm(outputDir, { recursive: true, force: true });
  });
});
