import { describe, it, expect } from 'vitest';
import { generateMockFactory } from './mock-factory';
import { DMMF } from '@prisma/generator-helper';

describe('generateMockFactory', () => {
  describe('this reference handling', () => {
    it('should handle this references in @mock annotations', () => {
      const model: DMMF.Model = {
        name: 'WorkLog',
        dbName: null,
        fields: [
          {
            name: 'startTime',
            kind: 'scalar',
            isList: false,
            isRequired: true,
            isUnique: false,
            isId: false,
            isReadOnly: false,
            type: 'DateTime',
            hasDefaultValue: false,
          },
          {
            name: 'endTime',
            kind: 'scalar',
            isList: false,
            isRequired: false,
            isUnique: false,
            isId: false,
            isReadOnly: false,
            type: 'DateTime',
            hasDefaultValue: false,
            documentation: '/// @mock faker.helpers.maybe(() => faker.date.between({ from: this.startTime, to: new Date() }), { probability: 0.8 })',
          },
        ],
        primaryKey: null,
        uniqueFields: [],
        uniqueIndexes: [],
        isGenerated: false,
      };

      const config = {
        createZodSchemas: true,
        createMockFactories: true,
        mockDateRange: 30,
        relationMaxDepth: 2,
        createRelationMocks: false,
        useMultipleFiles: false,
        writeBarrelFiles: true,
        createInputTypes: true,
        createModelTypes: true,
        createOptionalDefaultValuesTypes: true,
        createRelationValuesTypes: true,
        createPartialTypes: true,
        addInputTypeValidation: true,
        addIncludeType: true,
        addSelectType: true,
        useDefaultValidators: true,
        coerceDate: true,
        mockDataLocale: 'ja',
        mockOutputSeparate: false,
      };

      const dmmf: DMMF.Document = {
        datamodel: {
          enums: [],
          models: [model],
          types: [],
          indexes: [],
        },
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

      const result = generateMockFactory(model, config, dmmf);

      // baseDataオブジェクトが作成されることを確認
      expect(result).toContain('const baseData = {');
      // this.startTimeがbaseData.startTimeに置き換えられることを確認
      expect(result).toContain('baseData.startTime');
      // mockDataオブジェクトがbaseDataを含むことを確認
      expect(result).toContain('const mockData = {');
      expect(result).toContain('...baseData,');
    });
  });

  describe('CUID/UUID default value handling', () => {
    it('should generate CUID for @default(cuid()) fields', () => {
      const model: DMMF.Model = {
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
        ],
        primaryKey: null,
        uniqueFields: [],
        uniqueIndexes: [],
        isGenerated: false,
      };

      const config = {
        createZodSchemas: true,
        createMockFactories: true,
        mockDateRange: 30,
        relationMaxDepth: 2,
        createRelationMocks: false,
        useMultipleFiles: false,
        writeBarrelFiles: true,
        createInputTypes: true,
        createModelTypes: true,
        createOptionalDefaultValuesTypes: true,
        createRelationValuesTypes: true,
        createPartialTypes: true,
        addInputTypeValidation: true,
        addIncludeType: true,
        addSelectType: true,
        useDefaultValidators: true,
        coerceDate: true,
        mockDataLocale: 'ja',
        mockOutputSeparate: false,
      };

      const dmmf: DMMF.Document = {
        datamodel: {
          enums: [],
          models: [model],
          types: [],
          indexes: [],
        },
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

      const result = generateMockFactory(model, config, dmmf);

      // CUID生成のインラインコードが含まれていることを確認
      expect(result).toContain('(() => { const t = Date.now().toString(36)');
      expect(result).toContain('return `c${t}${r}${c}`');
      expect(result).toContain(".padEnd(25, '0').substring(0, 25)");
    });

    it('should generate UUID for @default(uuid()) fields', () => {
      const model: DMMF.Model = {
        name: 'Product',
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
            default: { name: 'uuid', args: [] },
          },
        ],
        primaryKey: null,
        uniqueFields: [],
        uniqueIndexes: [],
        isGenerated: false,
      };

      const config = {
        createZodSchemas: true,
        createMockFactories: true,
        mockDateRange: 30,
        relationMaxDepth: 2,
        createRelationMocks: false,
        useMultipleFiles: false,
        writeBarrelFiles: true,
        createInputTypes: true,
        createModelTypes: true,
        createOptionalDefaultValuesTypes: true,
        createRelationValuesTypes: true,
        createPartialTypes: true,
        addInputTypeValidation: true,
        addIncludeType: true,
        addSelectType: true,
        useDefaultValidators: true,
        coerceDate: true,
        mockDataLocale: 'ja',
        mockOutputSeparate: false,
      };

      const dmmf: DMMF.Document = {
        datamodel: {
          enums: [],
          models: [model],
          types: [],
          indexes: [],
        },
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

      const result = generateMockFactory(model, config, dmmf);

      // UUIDはfaker.string.uuid()を使用することを確認
      expect(result).toContain('faker.string.uuid()');
    });

    it('should handle autoincrement default', () => {
      const model: DMMF.Model = {
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
            type: 'Int',
            hasDefaultValue: true,
            default: { name: 'autoincrement', args: [] },
          },
        ],
        primaryKey: null,
        uniqueFields: [],
        uniqueIndexes: [],
        isGenerated: false,
      };

      const config = {
        createZodSchemas: true,
        createMockFactories: true,
        mockDateRange: 30,
        relationMaxDepth: 2,
        createRelationMocks: false,
        useMultipleFiles: false,
        writeBarrelFiles: true,
        createInputTypes: true,
        createModelTypes: true,
        createOptionalDefaultValuesTypes: true,
        createRelationValuesTypes: true,
        createPartialTypes: true,
        addInputTypeValidation: true,
        addIncludeType: true,
        addSelectType: true,
        useDefaultValidators: true,
        coerceDate: true,
        mockDataLocale: 'ja',
        mockOutputSeparate: false,
      };

      const dmmf: DMMF.Document = {
        datamodel: {
          enums: [],
          models: [model],
          types: [],
          indexes: [],
        },
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

      const result = generateMockFactory(model, config, dmmf);

      // autoincrementフィールドがfaker.number.intを使用することを確認
      expect(result).toContain('faker.number.int({ min: 1, max: 100000 })');
    });
  });
});
