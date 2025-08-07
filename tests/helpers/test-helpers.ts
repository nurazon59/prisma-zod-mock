import { DMMF, GeneratorOptions } from '@prisma/generator-helper';
import { expect } from 'vitest';

// DMMF Model作成ヘルパー
export function createMockModel(name: string, fields: Partial<DMMF.Field>[] = []): DMMF.Model {
  return {
    name,
    dbName: null,
    fields: fields.map((field, index) => ({
      name: field.name || `field${index}`,
      kind: field.kind || 'scalar',
      isList: field.isList || false,
      isRequired: field.isRequired ?? true,
      isUnique: field.isUnique || false,
      isId: field.isId || false,
      isReadOnly: field.isReadOnly || false,
      type: field.type || 'String',
      hasDefaultValue: field.hasDefaultValue || false,
      isGenerated: field.isGenerated || false,
      isUpdatedAt: field.isUpdatedAt || false,
      documentation: field.documentation,
      ...field,
    })),
    primaryKey: null,
    uniqueFields: [],
    uniqueIndexes: [],
    isGenerated: false,
  };
}

// DMMF DatamodelDocument作成ヘルパー
export function createMockDatamodel(
  models: DMMF.Model[] = [],
  enums: DMMF.DatamodelEnum[] = []
): DMMF.Document['datamodel'] {
  return {
    models,
    enums,
    types: [],
    indexes: [],
  };
}

// GeneratorOptions作成ヘルパー
export function createMockGeneratorOptions(
  overrides: Partial<GeneratorOptions> = {}
): GeneratorOptions {
  const defaultOptions: GeneratorOptions = {
    generator: {
      name: 'zod-mock',
      provider: { value: 'prisma-zod-mock', fromEnvVar: null },
      output: { value: './generated', fromEnvVar: null },
      config: {},
      binaryTargets: [],
      previewFeatures: [],
      isCustomOutput: false,
      sourceFilePath: 'generator.js',
    },
    dmmf: {
      datamodel: createMockDatamodel(),
      schema: {
        inputObjectTypes: { prisma: [] },
        outputObjectTypes: { prisma: [], model: [] },
        enumTypes: { prisma: [], model: [] },
        fieldRefTypes: { prisma: [] },
      },
      mappings: { modelOperations: [], otherOperations: { read: [], write: [] } },
    },
    otherGenerators: [],
    schemaPath: '/path/to/schema.prisma',
    datasources: [],
    datamodel: '',
    version: '5.0.0',
  };

  return {
    ...defaultOptions,
    ...overrides,
  };
}

// 深いマージが必要な場合のヘルパー
export function createMockGeneratorOptionsWithDeepMerge(
  generator?: Partial<GeneratorOptions['generator']>,
  dmmf?: Partial<GeneratorOptions['dmmf']>
): GeneratorOptions {
  const baseOptions = createMockGeneratorOptions();

  return {
    ...baseOptions,
    generator: {
      ...baseOptions.generator,
      ...generator,
    },
    dmmf: {
      ...baseOptions.dmmf,
      ...dmmf,
    },
  };
}

// ファイル内容検証ヘルパー
export function assertGeneratedCode(
  content: string,
  expectations: {
    imports?: string[];
    exports?: string[];
    functions?: string[];
    types?: string[];
    patterns?: RegExp[];
  }
) {
  if (expectations.imports) {
    expectations.imports.forEach((imp) => {
      expect(content).toContain(`import`);
      expect(content).toMatch(new RegExp(`from ['"]${imp}['"]`));
    });
  }

  if (expectations.exports) {
    expectations.exports.forEach((exp) => {
      expect(content).toMatch(new RegExp(`export.*${exp}`));
    });
  }

  if (expectations.functions) {
    expectations.functions.forEach((func) => {
      expect(content).toMatch(new RegExp(`function ${func}|const ${func}.*=.*\\(`));
    });
  }

  if (expectations.types) {
    expectations.types.forEach((type) => {
      expect(content).toMatch(new RegExp(`type ${type}|interface ${type}`));
    });
  }

  if (expectations.patterns) {
    expectations.patterns.forEach((pattern) => {
      expect(content).toMatch(pattern);
    });
  }

  // 構文エラーチェック（簡易版）
  expect(content).not.toMatch(/\{\{|\}\}/); // 二重括弧の検出
  expect(content).not.toMatch(/undefined\s*:/); // undefined キーの検出
}

// アノテーション作成ヘルパー
export function createFieldWithAnnotation(
  name: string,
  type: string,
  annotation: string
): Partial<DMMF.Field> {
  return {
    name,
    type,
    documentation: `/// @mock ${annotation}`,
  };
}

// デフォルト値付きフィールド作成ヘルパー
export function createFieldWithDefault(
  name: string,
  type: string,
  defaultValue: DMMF.FieldDefault
): Partial<DMMF.Field> {
  return {
    name,
    type,
    hasDefaultValue: true,
    default: defaultValue,
  };
}
