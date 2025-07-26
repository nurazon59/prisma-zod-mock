'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createMockDMMFField = createMockDMMFField;
exports.createMockDMMFModel = createMockDMMFModel;
exports.createMockDMMF = createMockDMMF;
function createMockDMMFField(overrides = {}) {
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
function createMockDMMFModel(overrides = {}) {
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
function createMockDMMF(overrides = {}) {
  return {
    datamodel: {
      enums: [],
      models: [],
      types: [],
    },
    schema: {
      inputObjectTypes: {
        prisma: [],
        model: null,
      },
      outputObjectTypes: {
        prisma: [],
        model: [],
      },
      enumTypes: {
        prisma: [],
        model: null,
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
//# sourceMappingURL=test-helpers.js.map
