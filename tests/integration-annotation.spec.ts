import { describe, it, expect } from 'vitest';
import { generateMockFactory } from '../src/templates/mock-factory';
import { createMockDMMFModel, createMockDMMFField, createMockDMMF } from './test-helpers';
import { defaultConfig } from '../src/generator/config/types';

describe('アノテーション付きmockFactory', () => {
  it('@zod-mockアノテーションが存在する場合は使用する', () => {
    const model = createMockDMMFModel({
      name: 'User',
      fields: [
        createMockDMMFField({
          name: 'email',
          type: 'String',
          documentation: '@mock faker.internet.email()',
        }),
        createMockDMMFField({
          name: 'age',
          type: 'Int',
          isRequired: false,
          documentation: '@mock faker.number.int({ min: 18, max: 100 })',
        }),
      ],
    });

    const dmmf = createMockDMMF();
    const config = { ...defaultConfig, createZodSchemas: false, mockDateRange: 30 };

    const result = generateMockFactory(model, config, dmmf);

    expect(result).toContain('email: faker.internet.email()');
    expect(result).toContain(
      'age: Math.random() > 0.5 ? faker.number.int({ min: 18, max: 100 }) : null'
    );
  });

  it('文字列リテラルアノテーションを処理する', () => {
    const model = createMockDMMFModel({
      name: 'User',
      fields: [
        createMockDMMFField({
          name: 'role',
          type: 'String',
          documentation: "@mock 'ADMIN'",
        }),
      ],
    });

    const dmmf = createMockDMMF();
    const config = { ...defaultConfig, createZodSchemas: false, mockDateRange: 30 };

    const result = generateMockFactory(model, config, dmmf);

    expect(result).toContain("role: 'ADMIN'");
  });

  it('アノテーションがない場合はセマンティック分析にフォールバックする', () => {
    const model = createMockDMMFModel({
      name: 'User',
      fields: [
        createMockDMMFField({
          name: 'email',
          type: 'String',
        }),
      ],
    });

    const dmmf = createMockDMMF();
    const config = { ...defaultConfig, createZodSchemas: false, mockDateRange: 30 };

    const result = generateMockFactory(model, config, dmmf);

    expect(result).toContain('email: faker.internet.email()');
  });

  it('アノテーション付きの複数行ドキュメントを処理する', () => {
    const model = createMockDMMFModel({
      name: 'User',
      fields: [
        createMockDMMFField({
          name: 'bio',
          type: 'String',
          documentation:
            'User biography\n@mock faker.lorem.paragraphs(3)\nThis field stores user bio',
        }),
      ],
    });

    const dmmf = createMockDMMF();
    const config = { ...defaultConfig, createZodSchemas: false, mockDateRange: 30 };

    const result = generateMockFactory(model, config, dmmf);

    expect(result).toContain('bio: faker.lorem.paragraphs(3)');
  });
});
