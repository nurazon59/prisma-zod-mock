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
  const hasRelations = model.fields.some((f) => f.kind === 'object');

  // モデル別の深度を取得（設定されていなければグローバル設定を使用）
  const modelMaxDepth = config.modelDepths?.[model.name] ?? config.relationMaxDepth;

  // メイン関数のシグネチャ（リレーションがある場合は深度パラメータを追加）
  let factory = '';
  if (config.createRelationMocks && hasRelations) {
    factory += `export const create${model.name}Mock = (\n`;
    factory += `  overrides?: Partial<${modelType}>,\n`;
    factory += `  depth: number = 0,\n`;
    factory += `  maxDepth: number = ${modelMaxDepth}\n`;
    factory += `): ${modelType} => {\n`;
  } else {
    factory += `export const create${model.name}Mock = (overrides?: Partial<${modelType}>): ${modelType} => {\n`;
  }

  // this参照があるフィールドをチェック
  const hasThisReference = model.fields.some((f) => f.documentation?.includes('this.') ?? false);

  if (hasThisReference) {
    // this参照がある場合は、まず基本データを作成
    factory += '  const baseData = {\n';

    // this参照を持たないフィールドを先に処理
    for (const field of model.fields) {
      if (field.kind === 'scalar' && !field.documentation?.includes('this.')) {
        factory += `    ${field.name}: ${generateFieldMockValue(field, config)},\n`;
      }
    }

    factory += '  };\n\n';
    factory += '  const mockData = {\n';
    factory += '    ...baseData,\n';

    // this参照を持つフィールドを後で処理
    for (const field of model.fields) {
      if (field.kind === 'scalar' && field.documentation?.includes('this.')) {
        const mockValue = generateFieldMockValue(field, config);
        // thisをbaseDataに置き換え
        const replacedValue = mockValue.replace(/\bthis\./g, 'baseData.');
        factory += `    ${field.name}: ${replacedValue},\n`;
      }
    }
  } else {
    // this参照がない場合は通常の処理
    factory += '  const mockData = {\n';

    // スカラーフィールドの処理
    for (const field of model.fields) {
      if (field.kind === 'scalar') {
        factory += `    ${field.name}: ${generateFieldMockValue(field, config)},\n`;
      }
    }
  }

  // リレーションフィールドの処理
  if (config.createRelationMocks) {
    for (const field of model.fields) {
      if (field.kind === 'object') {
        factory += generateRelationMockField(field, config, dmmf);
      }
    }
  }

  factory += '    ...overrides\n';
  factory += '  };\n';
  factory += '  return mockData;\n';
  factory += '};\n\n';

  // バッチ生成関数
  if (config.createRelationMocks && hasRelations) {
    factory += `export const create${model.name}MockBatch = (\n`;
    factory += `  count: number = 10,\n`;
    factory += `  overrides?: Partial<${modelType}>,\n`;
    factory += `  depth: number = 0,\n`;
    factory += `  maxDepth: number = ${modelMaxDepth}\n`;
    factory += `): ${modelType}[] => {\n`;
    factory += `  return Array.from({ length: count }, () => create${model.name}Mock(overrides, depth, maxDepth));\n`;
    factory += '};';
  } else {
    factory += `export const create${model.name}MockBatch = (\n`;
    factory += `  count: number = 10,\n`;
    factory += `  overrides?: Partial<${modelType}>\n`;
    factory += `): ${modelType}[] => {\n`;
    factory += `  return Array.from({ length: count }, () => create${model.name}Mock(overrides));\n`;
    factory += '};';
  }

  if (config.createZodSchemas) {
    factory += '\n\n';
    if (config.createRelationMocks && hasRelations) {
      factory += `export const createValidated${model.name}Mock = (\n`;
      factory += `  overrides?: Partial<${modelType}>,\n`;
      factory += `  depth: number = 0,\n`;
      factory += `  maxDepth: number = ${modelMaxDepth}\n`;
      factory += `): ${modelType} => {\n`;
      factory += `  const mockData = create${model.name}Mock(overrides, depth, maxDepth);\n`;
    } else {
      factory += `export const createValidated${model.name}Mock = (overrides?: Partial<${modelType}>): ${modelType} => {\n`;
      factory += `  const mockData = create${model.name}Mock(overrides);\n`;
    }
    factory += `  return ${model.name}Schema.parse(mockData);\n`;
    factory += '};';
  }

  return factory;
}

function generateRelationMockField(
  field: DMMF.Field,
  config: GeneratorConfig,
  dmmf: DMMF.Document
): string {
  // 深度チェックアノテーションのサポート
  const annotation = parseZodMockAnnotation(field);
  let customDepth: number | undefined;

  if (annotation && annotation.type === 'relationDepth' && annotation.relationDepth !== undefined) {
    customDepth = annotation.relationDepth;
  }

  // リレーションの種類を判定
  const isList = field.isList;
  const relatedModel = dmmf.datamodel.models.find((m) => m.name === field.type);

  if (!relatedModel) {
    return '';
  }

  // 深度チェックロジック
  let mockExpression = '';
  if (isList) {
    // 1対多 or 多対多
    const itemCount = field.isRequired ? '{ min: 1, max: 3 }' : '{ min: 0, max: 3 }';
    mockExpression = `depth < ${customDepth ? `Math.min(maxDepth, ${customDepth})` : 'maxDepth'} ? create${field.type}MockBatch(faker.number.int(${itemCount}), {}, depth + 1, maxDepth) : []`;
  } else {
    // 1対1
    if (field.isRequired) {
      mockExpression = `depth < ${customDepth ? `Math.min(maxDepth, ${customDepth})` : 'maxDepth'} ? create${field.type}Mock({}, depth + 1, maxDepth) : ({} as ${field.type})`;
    } else {
      mockExpression = `depth < ${customDepth ? `Math.min(maxDepth, ${customDepth})` : 'maxDepth'} ? (Math.random() > 0.5 ? create${field.type}Mock({}, depth + 1, maxDepth) : null) : null`;
    }
  }

  return `    ${field.name}: ${mockExpression},\n`;
}

function generateFieldMockValue(field: DMMF.Field, config: GeneratorConfig): string {
  const annotation = parseZodMockAnnotation(field);
  if (annotation && annotation.type !== 'relationDepth') {
    const mockValue = generateMockExpression(annotation, field);
    // faker.helpers.maybeが既に含まれている場合は、追加のランダム処理を加えない
    if (!field.isRequired && !mockValue.includes('faker.helpers.maybe')) {
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
          // 簡易的なCUID生成（c + timestamp + random）
          return "(() => { const t = Date.now().toString(36); const r = Math.random().toString(36).substring(2, 10); const c = Math.floor(Math.random() * 1000).toString(36); return `c${t}${r}${c}`.padEnd(25, '0').substring(0, 25); })()";
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
