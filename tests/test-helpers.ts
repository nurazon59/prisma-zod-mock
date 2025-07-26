import { DMMF } from '@prisma/generator-helper';

export function createMockDMMFField(overrides: Partial<DMMF.Field> = {}): DMMF.Field {
  return {
    name: 'testField',
    kind: 'scalar',
    isList: false,
    isRequired: true,
    isUnique: false,
    isId: false,
    isReadOnly: false,
    type: 'String',
    hasDefaultValue: false,
    ...overrides,
  };
}

export function createMockDMMFModel(overrides: Partial<DMMF.Model> = {}): DMMF.Model {
  return {
    name: 'TestModel',
    dbName: null,
    fields: [],
    uniqueFields: [],
    uniqueIndexes: [],
    documentation: undefined,
    primaryKey: null,
    isGenerated: false,
    ...overrides,
  };
}

export function createMockDMMF(overrides: Partial<DMMF.Document> = {}): DMMF.Document {
  return {
    datamodel: {
      enums: [],
      models: [],
      types: [],
      indexes: [],
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
    ...overrides,
  };
}
