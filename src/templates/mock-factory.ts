import { DMMF } from '@prisma/generator-helper';
import { GeneratorConfig } from '../generator/config/types';
import { analyzeFieldName } from '../mock/semantics/field-name-analyzer';
import {
  parseZodMockAnnotation,
  generateMockExpression,
} from '../generator/utils/parse-annotations';

export function generateMockFactory(
  model: DMMF.Model,
  config: GeneratorConfig,
  dmmf: DMMF.Document
): string {
  const modelType = config.createZodSchemas ? model.name : `Record<string, unknown>`;

  let factory = `export const create${model.name}Mock = (overrides?: Partial<${modelType}>): ${modelType} => {\n`;
  factory += '  return {\n';

  for (const field of model.fields) {
    if (field.kind === 'scalar') {
      factory += `    ${field.name}: ${generateFieldMockValue(field, config)},\n`;
    } else if (field.kind === 'object') {
      factory += `    ${field.name}: ${generateRelationMockValue(field, config, dmmf)},\n`;
    } else if (field.kind === 'enum') {
      factory += `    ${field.name}: ${generateEnumMockValue(field, config, dmmf)},\n`;
    }
  }

  factory += '    ...overrides\n';
  factory += '  };\n';
  factory += '};\n\n';

  factory += `export const create${model.name}MockBatch = (\n`;
  factory += `  count: number = 10,\n`;
  factory += `  overrides?: Partial<${modelType}>\n`;
  factory += `): ${modelType}[] => {\n`;
  factory += `  return Array.from({ length: count }, () => create${model.name}Mock(overrides));\n`;
  factory += '};';

  if (config.createZodSchemas) {
    factory += '\n\n';
    factory += `export const createValidated${model.name}Mock = (overrides?: Partial<${modelType}>): ${modelType} => {\n`;
    factory += `  const mockData = create${model.name}Mock(overrides);\n`;
    factory += `  return ${model.name}Schema.parse(mockData);\n`;
    factory += '};';
  }

  return factory;
}

function generateFieldMockValue(field: DMMF.Field, config: GeneratorConfig): string {
  const annotation = parseZodMockAnnotation(field);
  if (annotation) {
    const mockValue = generateMockExpression(annotation, field);
    if (!field.isRequired) {
      return `Math.random() > 0.5 ? ${mockValue} : null`;
    }
    return mockValue;
  }

  if (field.hasDefaultValue && field.default !== null && field.default !== undefined) {
    if (typeof field.default === 'object' && 'name' in field.default) {
      switch (field.default.name) {
        case 'now':
          return 'new Date()';
        case 'cuid':
          return 'faker.string.nanoid()';
        case 'uuid':
          return 'faker.string.uuid()';
        case 'autoincrement':
          return 'faker.number.int({ min: 1, max: 100000 })';
        case 'dbgenerated':
          break;
        default:
          break;
      }
    } else {
      const defaultValue = field.default;
      if (typeof defaultValue === 'string') {
        return `'${defaultValue}'`;
      } else if (typeof defaultValue === 'number' || typeof defaultValue === 'boolean') {
        return String(defaultValue);
      }
    }
  }

  const analysis = analyzeFieldName(field.name);

  const mockValue = getMockValueCode(analysis.inferredType, field.type, field.name, config);

  if (!field.isRequired) {
    return `Math.random() > 0.5 ? ${mockValue} : null`;
  }

  return mockValue;
}

function getMockValueCode(
  semanticType: string | undefined,
  fieldType: string,
  fieldName: string,
  config: GeneratorConfig
): string {
  if (!semanticType) {
    return getDefaultMockValueCode(fieldType, config);
  }

  switch (semanticType) {
    case 'email':
      return 'faker.internet.email()';
    case 'name':
      if (fieldName.toLowerCase().includes('first')) {
        return 'faker.person.firstName()';
      }
      if (fieldName.toLowerCase().includes('last')) {
        return 'faker.person.lastName()';
      }
      return 'faker.person.fullName()';
    case 'phone':
      return 'faker.phone.number()';
    case 'address':
      if (fieldName.toLowerCase().includes('city')) {
        return 'faker.location.city()';
      }
      if (fieldName.toLowerCase().includes('zip')) {
        return 'faker.location.zipCode()';
      }
      return 'faker.location.streetAddress()';
    case 'url':
      return 'faker.internet.url()';
    case 'description':
      return 'faker.lorem.paragraph()';
    case 'title':
      return 'faker.lorem.sentence()';
    case 'date':
      return `faker.date.recent({ days: ${config.mockDateRange} })`;
    case 'image':
      return 'faker.image.url()';
    case 'price':
      return fieldType === 'Float' || fieldType === 'Decimal'
        ? 'parseFloat(faker.commerce.price())'
        : 'parseInt(faker.commerce.price())';
    case 'country':
      return 'faker.location.country()';
    case 'company':
      return 'faker.company.name()';
    default:
      return getDefaultMockValueCode(fieldType, config);
  }
}

function getDefaultMockValueCode(fieldType: string, config: GeneratorConfig): string {
  switch (fieldType) {
    case 'String':
      return 'faker.string.alpha(10)';
    case 'Int':
      return 'faker.number.int({ min: 1, max: 1000 })';
    case 'Float':
    case 'Decimal':
      return 'faker.number.float({ min: 0, max: 1000, fractionDigits: 2 })';
    case 'Boolean':
      return 'faker.datatype.boolean()';
    case 'DateTime':
      return `faker.date.recent({ days: ${config.mockDateRange} })`;
    case 'BigInt':
      return 'BigInt(faker.number.int({ min: 1, max: 1000000 }))';
    case 'Json':
      return '{ key: faker.string.alpha(5), value: faker.number.int({ min: 1, max: 100 }) }';
    case 'Bytes':
      return 'Buffer.from(faker.string.alphanumeric(32))';
    default:
      return 'null';
  }
}

function generateRelationMockValue(field: DMMF.Field, config: GeneratorConfig, dmmf: DMMF.Document): string {
  // リレーション先のモデルを取得
  const relatedModel = dmmf.datamodel.models.find(m => m.name === field.type);
  
  if (!relatedModel) {
    return 'null';
  }
  
  // 循環参照を避けるため、リレーションフィールドは null または空配列にする
  if (field.isList) {
    return '[]';
  }
  
  // 必須フィールドでない場合は null
  if (!field.isRequired) {
    return 'null';
  }
  
  // 必須フィールドの場合は、リレーション先のIDフィールドのみを含むオブジェクトを返す
  const idField = relatedModel.fields.find(f => f.isId);
  if (idField) {
    const idValue = generateFieldMockValue(idField, config);
    return `{ ${idField.name}: ${idValue} }`;
  }
  
  return 'null';
}

function generateEnumMockValue(field: DMMF.Field, config: GeneratorConfig, dmmf: DMMF.Document): string {
  // Enum定義を探す
  const enumDef = dmmf.datamodel.enums.find(e => e.name === field.type);
  
  if (!enumDef || enumDef.values.length === 0) {
    return 'null';
  }
  
  // ランダムに値を選択
  const randomIndex = `Math.floor(Math.random() * ${enumDef.values.length})`;
  const enumValues = enumDef.values.map(v => `'${v.name}'`).join(', ');
  
  if (field.isList) {
    // 配列の場合は1〜3個のランダムな値を返す
    return `[${enumValues}].slice(0, faker.number.int({ min: 1, max: 3 }))`;
  }
  
  // 単一の値の場合
  const mockValue = `[${enumValues}][${randomIndex}]`;
  
  if (!field.isRequired) {
    return `Math.random() > 0.5 ? ${mockValue} : null`;
  }
  
  return mockValue;
}
