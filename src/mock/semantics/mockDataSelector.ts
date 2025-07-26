import { faker } from '@faker-js/faker';
import { SemanticType } from './fieldNameAnalyzer';

export interface MockOptions {
  min?: number;
  max?: number;
  locale?: string;
  seed?: number;
}

export function selectMockData(
  semanticType: SemanticType,
  fieldType: string,
  fieldName?: string,
  options?: MockOptions
): any {
  if (options?.seed) {
    faker.seed(options.seed);
  }

  // Locale setting is handled differently in newer versions of faker
  // For now, we'll skip this functionality

  switch (semanticType) {
    case 'email':
      return faker.internet.email();

    case 'name':
      if (fieldName?.toLowerCase().includes('first')) {
        return faker.person.firstName();
      }
      if (fieldName?.toLowerCase().includes('last')) {
        return faker.person.lastName();
      }
      return faker.person.fullName();

    case 'phone':
      return faker.phone.number();

    case 'address':
      if (fieldName?.toLowerCase().includes('city')) {
        return faker.location.city();
      }
      if (fieldName?.toLowerCase().includes('zip') || fieldName?.toLowerCase().includes('postal')) {
        return faker.location.zipCode();
      }
      return faker.location.streetAddress();

    case 'url':
      return faker.internet.url();

    case 'description':
      return faker.lorem.paragraph();

    case 'title':
      return faker.lorem.sentence();

    case 'date':
      if (fieldName?.toLowerCase().includes('birth')) {
        return faker.date.past();
      }
      return faker.date.recent();

    case 'image':
      if (fieldName?.toLowerCase().includes('avatar')) {
        return faker.image.avatar();
      }
      return faker.image.url();

    case 'price': {
      const priceString = faker.commerce.price();
      return fieldType === 'Float' || fieldType === 'Decimal'
        ? parseFloat(priceString)
        : parseInt(priceString);
    }

    case 'country':
      return faker.location.country();

    case 'company':
      return faker.company.name();

    default:
      return generateByFieldType(fieldType, options);
  }
}

function generateByFieldType(fieldType: string, options?: MockOptions): any {
  switch (fieldType) {
    case 'String':
      return faker.string.alpha({ length: 10 });

    case 'Int':
      return faker.number.int({
        min: options?.min ?? 1,
        max: options?.max ?? 1000,
      });

    case 'Float':
    case 'Decimal':
      return faker.number.float({
        min: options?.min ?? 0,
        max: options?.max ?? 1000,
        fractionDigits: 2,
      });

    case 'Boolean':
      return faker.datatype.boolean();

    case 'DateTime':
      return faker.date.recent();

    case 'BigInt':
      return BigInt(faker.number.int({ min: 1, max: 1000000 }));

    case 'Json':
      return {
        key: faker.string.alpha(5),
        value: faker.number.int({ min: 1, max: 100 }),
      };

    case 'Bytes':
      return Buffer.from(faker.string.alphanumeric(32));

    default:
      throw new Error(`Unsupported field type: ${fieldType}`);
  }
}
