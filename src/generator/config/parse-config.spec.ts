import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseConfig } from './parse-config';
import { GeneratorOptions } from '@prisma/generator-helper';

describe('parseConfig', () => {
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
          models: [],
          types: [],
          indexes: [],
        },
        schema: {
          inputObjectTypes: {
            prisma: [],
            model: [],
          },
          outputObjectTypes: {
            prisma: [],
            model: [],
          },
          enumTypes: {
            prisma: [],
            model: [],
          },
          fieldRefTypes: {
            prisma: [],
          },
          rootMutationType: undefined,
          rootQueryType: undefined,
        },
        mappings: {
          modelOperations: [],
          otherOperations: {
            read: [],
            write: [],
          },
        },
      },
      schemaPath: 'schema.prisma',
      datasources: [],
      datamodel: '',
      version: '5.0.0',
      otherGenerators: [],
    };
  });

  describe('真偽値設定のパース', () => {
    it('createZodSchemasを正しくパースする', () => {
      mockOptions.generator.config.createZodSchemas = 'false';
      const config = parseConfig(mockOptions);
      expect(config.createZodSchemas).toBe(false);
    });

    it('createMockFactoriesを正しくパースする', () => {
      mockOptions.generator.config.createMockFactories = 'false';
      const config = parseConfig(mockOptions);
      expect(config.createMockFactories).toBe(false);
    });

    it('useMultipleFilesを正しくパースする', () => {
      mockOptions.generator.config.useMultipleFiles = 'true';
      const config = parseConfig(mockOptions);
      expect(config.useMultipleFiles).toBe(true);
    });

    it('createRelationMocksを正しくパースする', () => {
      mockOptions.generator.config.createRelationMocks = 'false';
      const config = parseConfig(mockOptions);
      expect(config.createRelationMocks).toBe(false);
    });

    it('mockOutputSeparateを正しくパースする', () => {
      mockOptions.generator.config.mockOutputSeparate = 'true';
      const config = parseConfig(mockOptions);
      expect(config.mockOutputSeparate).toBe(true);
    });
  });

  describe('数値設定のパース', () => {
    it('mockSeedを正しくパースする', () => {
      mockOptions.generator.config.mockSeed = '42';
      const config = parseConfig(mockOptions);
      expect(config.mockSeed).toBe(42);
    });

    it('mockDateRangeを正しくパースする', () => {
      mockOptions.generator.config.mockDateRange = '60';
      const config = parseConfig(mockOptions);
      expect(config.mockDateRange).toBe(60);
    });

    it('relationMaxDepthを正しくパースする', () => {
      mockOptions.generator.config.relationMaxDepth = '5';
      const config = parseConfig(mockOptions);
      expect(config.relationMaxDepth).toBe(5);
    });
  });

  describe('文字列設定のパース', () => {
    it('mockDataLocaleを正しくパースする', () => {
      mockOptions.generator.config.mockDataLocale = 'ja';
      const config = parseConfig(mockOptions);
      expect(config.mockDataLocale).toBe('ja');
    });
  });

  describe('JSON設定のパース', () => {
    it('modelDepthsを正しくパースする', () => {
      mockOptions.generator.config.modelDepths = '{"User": 3, "Post": 2}';
      const config = parseConfig(mockOptions);
      expect(config.modelDepths).toEqual({ User: 3, Post: 2 });
    });

    it('modelDepthsの無効なJSONを処理する', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockOptions.generator.config.modelDepths = 'invalid json';
      const config = parseConfig(mockOptions);
      expect(config.modelDepths).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to parse modelDepths JSON:',
        'invalid json'
      );
      consoleWarnSpy.mockRestore();
    });

    it('空のmodelDepths JSONを処理する', () => {
      mockOptions.generator.config.modelDepths = '{}';
      const config = parseConfig(mockOptions);
      expect(config.modelDepths).toEqual({});
    });
  });

  describe('デフォルト値', () => {
    it('設定が空の場合はデフォルト値を使用する', () => {
      const config = parseConfig(mockOptions);
      expect(config.createZodSchemas).toBe(true);
      expect(config.createMockFactories).toBe(true);
      expect(config.useMultipleFiles).toBe(false);
      expect(config.createRelationMocks).toBe(true);
      expect(config.mockDateRange).toBe(30);
      expect(config.relationMaxDepth).toBe(4);
      expect(config.mockDataLocale).toBe('en');
      expect(config.mockOutputSeparate).toBe(false);
    });

    it('文字列以外の値を保持する', () => {
      // @ts-expect-error - testing non-string value
      mockOptions.generator.config.mockSeed = 99;
      // @ts-expect-error - testing non-string value
      mockOptions.generator.config.mockDateRange = 45;
      const config = parseConfig(mockOptions);
      // non-string numbersは直接設定できないので、undefinedまたはパース後の値になる
      expect(config.mockSeed).toBeUndefined();
      expect(config.mockDateRange).toBe(30); // デフォルト値
    });
  });

  describe('全設定の統合テスト', () => {
    it('全ての設定を正しくパースする', () => {
      mockOptions.generator.config = {
        createZodSchemas: 'false',
        createMockFactories: 'false',
        useMultipleFiles: 'true',
        writeBarrelFiles: 'false',
        createInputTypes: 'false',
        createModelTypes: 'false',
        createPartialTypes: 'false',
        useDefaultValidators: 'false',
        coerceDate: 'false',
        mockDataLocale: 'ja',
        mockOutputSeparate: 'true',
        mockSeed: '123',
        mockDateRange: '90',
        createRelationMocks: 'false',
        relationMaxDepth: '6',
        modelDepths: '{"User": 2}',
      };

      const config = parseConfig(mockOptions);

      expect(config.createZodSchemas).toBe(false);
      expect(config.createMockFactories).toBe(false);
      expect(config.useMultipleFiles).toBe(true);
      expect(config.writeBarrelFiles).toBe(false);
      expect(config.createInputTypes).toBe(false);
      expect(config.createModelTypes).toBe(false);
      expect(config.createPartialTypes).toBe(false);
      expect(config.useDefaultValidators).toBe(false);
      expect(config.coerceDate).toBe(false);
      expect(config.mockDataLocale).toBe('ja');
      expect(config.mockOutputSeparate).toBe(true);
      expect(config.mockSeed).toBe(123);
      expect(config.mockDateRange).toBe(90);
      expect(config.createRelationMocks).toBe(false);
      expect(config.relationMaxDepth).toBe(6);
      expect(config.modelDepths).toEqual({ User: 2 });
    });
  });
});
