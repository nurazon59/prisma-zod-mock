import { describe, it, expect } from 'vitest';
import { generate } from '../src/generator/generatorHandler';
import { GeneratorOptions } from '@prisma/generator-helper';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Integration Tests', () => {
  it('should generate complete output for a complex schema', async () => {
    const outputDir = path.join(__dirname, 'temp-output');

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
          mockDataLocale: 'ja',
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
                  name: 'email',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: true,
                  isId: false,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: false,
                },
                {
                  name: 'name',
                  kind: 'scalar',
                  isList: false,
                  isRequired: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: false,
                },
                {
                  name: 'age',
                  kind: 'scalar',
                  isList: false,
                  isRequired: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'Int',
                  hasDefaultValue: false,
                },
                {
                  name: 'bio',
                  kind: 'scalar',
                  isList: false,
                  isRequired: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: false,
                },
                {
                  name: 'createdAt',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  type: 'DateTime',
                  hasDefaultValue: true,
                  default: { name: 'now', args: [] },
                },
              ],
              primaryKey: null,
              uniqueFields: [],
              uniqueIndexes: [],
              isGenerated: false,
            },
          ],
          types: [],
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
      schemaPath: path.join(__dirname, 'test.prisma'),
      datasources: [],
      datamodel: '',
      version: '5.14.0',
      otherGenerators: [],
    };

    await generate(options);

    // Check if file was created
    const outputPath = path.join(outputDir, 'index.ts');
    const fileExists = await fs
      .access(outputPath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);

    // Read and check content
    const content = await fs.readFile(outputPath, 'utf-8');

    // Check imports
    expect(content).toContain("import { z } from 'zod';");
    expect(content).toContain("import { faker } from '@faker-js/faker';");

    // Check Zod schema generation
    expect(content).toContain('export const UserSchema = z.object({');
    expect(content).toContain('id: z.string()');
    expect(content).toContain('email: z.string()');
    expect(content).toContain('name: z.string().nullable()');
    expect(content).toContain('age: z.number().int().nullable()');
    expect(content).toContain('bio: z.string().nullable()');
    expect(content).toContain('createdAt: z.coerce.date()');

    // Check type export
    expect(content).toContain('export type User = z.infer<typeof UserSchema>;');

    // Check mock factory generation
    expect(content).toContain(
      'export const createUserMock = (overrides?: Partial<User>): User => {'
    );
    expect(content).toContain('faker.string.nanoid()');
    expect(content).toContain('faker.internet.email()');
    expect(content).toContain('faker.person.fullName()');
    expect(content).toContain('faker.lorem.paragraph()');
    expect(content).toContain('new Date()');
    expect(content).toContain('...overrides');

    // Check batch factory
    expect(content).toContain('export const createUserMockBatch =');
    expect(content).toContain('Array.from({ length: count }, () => createUserMock(overrides))');

    // Check validated factory
    expect(content).toContain('export const createValidatedUserMock =');
    expect(content).toContain('UserSchema.parse(mockData)');

    // Cleanup
    await fs.rm(outputDir, { recursive: true, force: true });
  });

  it('should generate multiple files when useMultipleFiles is true', async () => {
    const outputDir = path.join(__dirname, 'temp-output-multiple');

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
          useMultipleFiles: 'true',
          writeBarrelFiles: 'true',
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
                  name: 'email',
                  kind: 'scalar',
                  isList: false,
                  isRequired: true,
                  isUnique: true,
                  isId: false,
                  isReadOnly: false,
                  type: 'String',
                  hasDefaultValue: false,
                },
              ],
              primaryKey: null,
              uniqueFields: [],
              uniqueIndexes: [],
              isGenerated: false,
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
              ],
              primaryKey: null,
              uniqueFields: [],
              uniqueIndexes: [],
              isGenerated: false,
            },
          ],
          types: [],
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
      schemaPath: path.join(__dirname, 'test.prisma'),
      datasources: [],
      datamodel: '',
      version: '5.14.0',
      otherGenerators: [],
    };

    await generate(options);

    // Check directory structure
    const schemasDir = path.join(outputDir, 'schemas');
    const mocksDir = path.join(outputDir, 'mocks');

    const schemaDirExists = await fs
      .access(schemasDir)
      .then(() => true)
      .catch(() => false);
    const mocksDirExists = await fs
      .access(mocksDir)
      .then(() => true)
      .catch(() => false);

    expect(schemaDirExists).toBe(true);
    expect(mocksDirExists).toBe(true);

    // Check individual files
    const userSchemaPath = path.join(schemasDir, 'user.ts');
    const postSchemaPath = path.join(schemasDir, 'post.ts');
    const userMockPath = path.join(mocksDir, 'user.mock.ts');
    const postMockPath = path.join(mocksDir, 'post.mock.ts');
    const indexPath = path.join(outputDir, 'index.ts');

    const userSchemaExists = await fs
      .access(userSchemaPath)
      .then(() => true)
      .catch(() => false);
    const postSchemaExists = await fs
      .access(postSchemaPath)
      .then(() => true)
      .catch(() => false);
    const userMockExists = await fs
      .access(userMockPath)
      .then(() => true)
      .catch(() => false);
    const postMockExists = await fs
      .access(postMockPath)
      .then(() => true)
      .catch(() => false);
    const indexExists = await fs
      .access(indexPath)
      .then(() => true)
      .catch(() => false);

    expect(userSchemaExists).toBe(true);
    expect(postSchemaExists).toBe(true);
    expect(userMockExists).toBe(true);
    expect(postMockExists).toBe(true);
    expect(indexExists).toBe(true);

    // Check barrel file content
    const indexContent = await fs.readFile(indexPath, 'utf-8');
    expect(indexContent).toContain("export * from './schemas/user';");
    expect(indexContent).toContain("export * from './schemas/post';");
    expect(indexContent).toContain("export * from './mocks/user.mock';");
    expect(indexContent).toContain("export * from './mocks/post.mock';");

    // Cleanup
    await fs.rm(outputDir, { recursive: true, force: true });
  });
});
