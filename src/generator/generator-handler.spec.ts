import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeneratorOptions } from '@prisma/generator-helper';
import { generate } from './generator-handler';
import * as fs from 'fs/promises';
import * as path from 'path';

vi.mock('fs/promises');
vi.mock('path');

describe('ジェネレーターハンドラー', () => {
  let mockOptions: GeneratorOptions;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOptions = {
      generator: {
        name: 'prisma-zod-mock',
        provider: {
          fromEnvVar: null,
          value: 'prisma-zod-mock',
        },
        output: {
          value: '/test/output',
          fromEnvVar: null,
        },
        config: {},
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
      schemaPath: '/test/schema.prisma',
      datasources: [],
      datamodel: '',
      version: '5.14.0',
      otherGenerators: [],
    };

    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(path.resolve).mockImplementation((...args) => args.join('/'));
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
  });

  describe('生成処理', () => {
    it('出力ディレクトリが存在しない場合は作成する', async () => {
      await generate(mockOptions);

      expect(fs.mkdir).toHaveBeenCalledWith('/test/output', { recursive: true });
    });

    it('デフォルトでは単一ファイル出力を生成する', async () => {
      await generate(mockOptions);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('/test/output/index.ts'),
        expect.any(String),
        'utf-8'
      );
    });

    it('createZodSchemasがtrueの場合はZodスキーマを生成する', async () => {
      mockOptions.generator.config.createZodSchemas = 'true';

      await generate(mockOptions);

      const writeFileCalls = vi.mocked(fs.writeFile).mock.calls;
      const generatedContent = writeFileCalls[0][1] as string;

      expect(generatedContent).toContain('export const UserSchema = z.object({');
      expect(generatedContent).toContain('id: z.string()');
      expect(generatedContent).toContain('email: z.string()');
      expect(generatedContent).toContain('name: z.string().nullable()');
    });

    it('createMockFactoriesがtrueの場合はモックファクトリを生成する', async () => {
      mockOptions.generator.config.createMockFactories = 'true';

      await generate(mockOptions);

      const writeFileCalls = vi.mocked(fs.writeFile).mock.calls;
      const generatedContent = writeFileCalls[0][1] as string;

      expect(generatedContent).toContain(
        'export const createUserMock = (overrides?: Partial<User>): User => {'
      );
      expect(generatedContent).toContain('faker');
    });

    it('useMultipleFilesオプションを尊重する', async () => {
      mockOptions.generator.config.useMultipleFiles = 'true';

      await generate(mockOptions);

      expect(fs.mkdir).toHaveBeenCalledWith('/test/output/schemas', { recursive: true });
      expect(fs.mkdir).toHaveBeenCalledWith('/test/output/mocks', { recursive: true });

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('/test/output/schemas/user.ts'),
        expect.any(String),
        'utf-8'
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('/test/output/mocks/user.mock.ts'),
        expect.any(String),
        'utf-8'
      );
    });

    it('writeBarrelFilesがtrueの場合はバレルファイルを生成する', async () => {
      mockOptions.generator.config.useMultipleFiles = 'true';
      mockOptions.generator.config.writeBarrelFiles = 'true';

      await generate(mockOptions);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('/test/output/index.ts'),
        expect.stringContaining('export * from'),
        'utf-8'
      );
    });

    it('空のモデルを適切に処理する', async () => {
      mockOptions = {
        ...mockOptions,
        dmmf: {
          ...mockOptions.dmmf,
          datamodel: {
            ...mockOptions.dmmf.datamodel,
            models: [],
          },
        },
      };

      await generate(mockOptions);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('/test/output/index.ts'),
        expect.any(String),
        'utf-8'
      );
    });

    it('生成完了時に成功メッセージをログ出力する', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await generate(mockOptions);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✔ Generated Prisma Zod Mock')
      );

      consoleLogSpy.mockRestore();
    });

    it('出力ディレクトリが指定されていない場合はエラーをスローする', async () => {
      mockOptions.generator.output = null;

      await expect(generate(mockOptions)).rejects.toThrow(
        'No output was specified for Prisma Zod Mock Generator'
      );
    });
  });
});
