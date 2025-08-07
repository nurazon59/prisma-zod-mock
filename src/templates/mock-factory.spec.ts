import { describe, it, expect } from 'vitest';
import { generateMockFactory } from './mock-factory';
import { DMMF } from '@prisma/generator-helper';
import {
  createMockModel,
  createMockDatamodel,
  createFieldWithAnnotation,
  assertGeneratedCode,
} from '../../tests/helpers/test-helpers';

// 共通の設定オブジェクト作成ヘルパー
function createMockConfig(overrides = {}) {
  return {
    createZodSchemas: false,
    createMockFactories: true,
    mockDateRange: 30,
    relationMaxDepth: 2,
    createRelationMocks: false,
    useMultipleFiles: false,
    writeBarrelFiles: true,
    createInputTypes: true,
    createModelTypes: true,
    createPartialTypes: true,
    useDefaultValidators: true,
    coerceDate: true,
    mockDataLocale: 'ja',
    mockOutputSeparate: false,
    ...overrides,
  };
}

// DMMF Document作成ヘルパー
function createMockDMMF(models: DMMF.Model[]): DMMF.Document {
  return {
    datamodel: createMockDatamodel(models),
    schema: {
      inputObjectTypes: { prisma: [] },
      outputObjectTypes: { prisma: [], model: [] },
      enumTypes: { prisma: [], model: [] },
      fieldRefTypes: { prisma: [] },
      rootMutationType: undefined,
      rootQueryType: undefined,
    },
    mappings: {
      modelOperations: [],
      otherOperations: { read: [], write: [] },
    },
  };
}

describe('generateMockFactory', () => {
  describe('基本的な型の生成', () => {
    const testCases = [
      { type: 'String', expected: 'faker.lorem.word()' },
      { type: 'Int', expected: 'faker.number.int' },
      { type: 'Float', expected: 'faker.number.float' },
      { type: 'Boolean', expected: 'faker.datatype.boolean()' },
      { type: 'DateTime', expected: 'faker.date.recent()' },
      { type: 'Decimal', expected: 'new Prisma.Decimal' },
      { type: 'BigInt', expected: 'BigInt(faker.number.int' },
      {
        type: 'Json',
        expected: '{ key: faker.string.alpha(5), value: faker.number.int({ min: 1, max: 100 }) }',
      },
      { type: 'Bytes', expected: 'Buffer.from(faker.string.alphanumeric(32))' },
    ];

    it.each(testCases)('$type型を正しく生成する', ({ type, expected }) => {
      const model = createMockModel(`${type}Model`, [{ name: 'testField', type, kind: 'scalar' }]);

      const config = createMockConfig();
      const dmmf = createMockDMMF([model]);
      const result = generateMockFactory(model, config, dmmf);

      expect(result).toContain(expected);
      assertGeneratedCode(result, {
        functions: [`createMock${type}Model`],
      });
    });

    it('不明なフィールドタイプをnullで処理する', () => {
      const model = createMockModel('UnknownModel', [
        { name: 'unknownField', type: 'UnknownType' },
      ]);

      const config = createMockConfig();
      const dmmf = createMockDMMF([model]);
      const result = generateMockFactory(model, config, dmmf);

      expect(result).toContain('unknownField: null');
    });
  });

  describe('デフォルト値のハンドリング', () => {
    const defaultTestCases = [
      {
        name: 'CUID',
        field: {
          name: 'id',
          type: 'String',
          isId: true,
          hasDefaultValue: true,
          default: { name: 'cuid', args: [] },
        },
        expected: [
          '(() => { const t = Date.now().toString(36)',
          ".padEnd(25, '0').substring(0, 25)",
        ],
      },
      {
        name: 'UUID',
        field: {
          name: 'id',
          type: 'String',
          isId: true,
          hasDefaultValue: true,
          default: { name: 'uuid', args: [] },
        },
        expected: ['faker.string.uuid()'],
      },
      {
        name: 'autoincrement',
        field: {
          name: 'id',
          type: 'Int',
          isId: true,
          hasDefaultValue: true,
          default: { name: 'autoincrement', args: [] },
        },
        expected: ['faker.number.int({ min: 1, max: 100000 })'],
      },
    ];

    it.each(defaultTestCases)('@default($name)を正しく処理する', ({ name, field, expected }) => {
      const model = createMockModel(`${name}Model`, [field]);

      const config = createMockConfig({
        createZodSchemas: true,
        createOptionalDefaultValuesTypes: true,
        createRelationValuesTypes: true,
        addInputTypeValidation: true,
        addIncludeType: true,
        addSelectType: true,
      });

      const dmmf = createMockDMMF([model]);
      const result = generateMockFactory(model, config, dmmf);

      expected.forEach((exp) => {
        expect(result).toContain(exp);
      });
    });
  });

  describe('アノテーション処理', () => {
    it('this参照を含む@mockアノテーションを処理する', () => {
      const model = createMockModel('WorkLog', [
        {
          name: 'startTime',
          type: 'DateTime',
        },
        {
          name: 'endTime',
          type: 'DateTime',
          isRequired: false,
          documentation:
            '/// @mock faker.helpers.maybe(() => faker.date.between({ from: this.startTime, to: new Date() }), { probability: 0.8 })',
        },
      ]);

      const config = createMockConfig({
        createZodSchemas: true,
        createOptionalDefaultValuesTypes: true,
        createRelationValuesTypes: true,
        addInputTypeValidation: true,
        addIncludeType: true,
        addSelectType: true,
      });

      const dmmf = createMockDMMF([model]);
      const result = generateMockFactory(model, config, dmmf);

      // baseDataオブジェクトの生成とthis参照の置き換えを確認
      assertGeneratedCode(result, {
        patterns: [
          /const baseData = \{/,
          /baseData\.startTime/,
          /const mockData = \{/,
          /\.\.\.baseData,/,
        ],
      });
    });

    it('複数のアノテーションパターンを処理する', () => {
      const model = createMockModel('User', [
        createFieldWithAnnotation('email', 'String', 'faker.internet.email()'),
        createFieldWithAnnotation('age', 'Int', '.range(18, 65)'),
        createFieldWithAnnotation('status', 'String', '.enum("active", "inactive")'),
      ]);

      const config = createMockConfig();
      const dmmf = createMockDMMF([model]);
      const result = generateMockFactory(model, config, dmmf);

      expect(result).toContain('faker.internet.email()');
      expect(result).toContain('faker.number.int({ min: 18, max: 65 })');
      expect(result).toContain('faker.helpers.arrayElement(["active", "inactive"])');
    });
  });

  describe('リレーション処理', () => {
    it('リレーションフィールドを含むモデルを処理する', () => {
      const userModel = createMockModel('User', [
        { name: 'id', type: 'String', isId: true },
        { name: 'posts', type: 'Post', kind: 'object', isList: true },
      ]);

      const postModel = createMockModel('Post', [
        { name: 'id', type: 'String', isId: true },
        { name: 'author', type: 'User', kind: 'object' },
      ]);

      const config = createMockConfig({ createRelationMocks: true });
      const dmmf = createMockDMMF([userModel, postModel]);
      const result = generateMockFactory(userModel, config, dmmf);

      assertGeneratedCode(result, {
        functions: ['createMockUser'],
        patterns: [/relationMaxDepth|maxDepth|depth/], // リレーション深度の参照を確認
      });
    });
  });

  describe('特殊ケース', () => {
    it('フィールドがないモデルを処理する', () => {
      const model = createMockModel('EmptyModel', []);

      const config = createMockConfig();
      const dmmf = createMockDMMF([model]);
      const result = generateMockFactory(model, config, dmmf);

      expect(result).toContain('createMockEmptyModel');
      expect(result).toContain('return {}');
    });

    it('オプショナルフィールドを正しく処理する', () => {
      const model = createMockModel('OptionalModel', [
        { name: 'required', type: 'String', isRequired: true },
        { name: 'optional', type: 'String', isRequired: false },
      ]);

      const config = createMockConfig();
      const dmmf = createMockDMMF([model]);
      const result = generateMockFactory(model, config, dmmf);

      // オプショナルフィールドがundefinedになる可能性があることを確認
      expect(result).toMatch(/optional:.*undefined|optional:.*\?/);
    });

    it('リストフィールドを配列として生成する', () => {
      const model = createMockModel('ListModel', [{ name: 'tags', type: 'String', isList: true }]);

      const config = createMockConfig();
      const dmmf = createMockDMMF([model]);
      const result = generateMockFactory(model, config, dmmf);

      // 配列生成のパターンを確認
      expect(result).toMatch(/tags:.*\[.*\]|tags:.*Array/);
    });
  });
});
