import { DMMF } from '@prisma/generator-helper';
import { GeneratorConfig } from '../generator/config/types';
import { analyzeFieldName } from '../mock/semantics/fieldNameAnalyzer';
import { parseZodMockAnnotation, generateMockExpression } from '../generator/utils/parseAnnotations';

export function generateMockFactory(
  model: DMMF.Model,
  config: GeneratorConfig,
  _dmmf: DMMF.Document
): string {
  const modelType = config.createZodSchemas ? model.name : `Record<string, unknown>`;

  let factory = `export const create${model.name}Mock = (overrides?: Partial<${modelType}>): ${modelType} => {\n`;
  factory += '  return {\n';

  for (const field of model.fields) {
    if (field.kind === 'scalar') {
      factory += `    ${field.name}: ${generateFieldMockValue(field, config)},\n`;
    }
  }

  factory += '    ...overrides\n';
  factory += '  };\n';
  factory += '};\n\n';

  // Generate batch factory
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
  // Check for @mock annotations first
  const annotation = parseZodMockAnnotation(field);
  if (annotation) {
    const mockValue = generateMockExpression(annotation, field);
    if (!field.isRequired) {
      return `Math.random() > 0.5 ? ${mockValue} : null`;
    }
    return mockValue;
  }

  // Handle Prisma default values
  if (field.hasDefaultValue && field.default !== null && field.default !== undefined) {
    // Handle function defaults
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
          // For database generated values, fall through to semantic generation
          break;
        default:
          // For unknown function defaults, fall through
          break;
      }
    } else {
      // Handle static defaults (string, number, boolean)
      const defaultValue = field.default;
      if (typeof defaultValue === 'string') {
        return `'${defaultValue}'`;
      } else if (typeof defaultValue === 'number' || typeof defaultValue === 'boolean') {
        return String(defaultValue);
      }
    }
  }

  // Semantic type analysis as fallback
  const semanticType = analyzeFieldName(field.name);

  // Generate based on semantic type
  const mockValue = getMockValueCode(semanticType, field.type, field.name, config);

  if (!field.isRequired) {
    return `Math.random() > 0.5 ? ${mockValue} : null`;
  }

  return mockValue;
}

function getMockValueCode(
  semanticType: string,
  fieldType: string,
  fieldName: string,
  config: GeneratorConfig
): string {
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
