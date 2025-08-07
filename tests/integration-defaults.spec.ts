import { describe, it, expect } from 'vitest';
import { generateMockFactory } from '../src/templates/mock-factory';
import { createMockDMMFModel, createMockDMMFField, createMockDMMF } from './test-helpers';
import { defaultConfig } from '../src/generator/config/types';

describe('デフォルト値を持つmockFactory', () => {
  it('アノテーションがない場合は静的文字列デフォルト値を使用する', () => {
    const model = createMockDMMFModel({
      name: 'User',
      fields: [
        createMockDMMFField({
          name: 'role',
          type: 'String',
          hasDefaultValue: true,
          default: 'USER',
        }),
        createMockDMMFField({
          name: 'status',
          type: 'String',
          hasDefaultValue: true,
          default: 'active',
        }),
      ],
    });

    const dmmf = createMockDMMF();
    const config = { ...defaultConfig, createZodSchemas: false, mockDateRange: 30 };

    const result = generateMockFactory(model, config, dmmf);

    expect(result).toContain("role: 'USER'");
    expect(result).toContain("status: 'active'");
  });

  it('数値デフォルト値を使用する', () => {
    const model = createMockDMMFModel({
      name: 'Product',
      fields: [
        createMockDMMFField({
          name: 'stock',
          type: 'Int',
          hasDefaultValue: true,
          default: 100,
        }),
        createMockDMMFField({
          name: 'price',
          type: 'Float',
          hasDefaultValue: true,
          default: 99.99,
        }),
      ],
    });

    const dmmf = createMockDMMF();
    const config = { ...defaultConfig, createZodSchemas: false, mockDateRange: 30 };

    const result = generateMockFactory(model, config, dmmf);

    expect(result).toContain('stock: 100');
    expect(result).toContain('price: 99.99');
  });

  it('真偽値デフォルト値を使用する', () => {
    const model = createMockDMMFModel({
      name: 'Settings',
      fields: [
        createMockDMMFField({
          name: 'emailNotifications',
          type: 'Boolean',
          hasDefaultValue: true,
          default: true,
        }),
        createMockDMMFField({
          name: 'marketingEmails',
          type: 'Boolean',
          hasDefaultValue: true,
          default: false,
        }),
      ],
    });

    const dmmf = createMockDMMF();
    const config = { ...defaultConfig, createZodSchemas: false, mockDateRange: 30 };

    const result = generateMockFactory(model, config, dmmf);

    expect(result).toContain('emailNotifications: true');
    expect(result).toContain('marketingEmails: false');
  });

  it('関数デフォルトを処理する', () => {
    const model = createMockDMMFModel({
      name: 'Post',
      fields: [
        createMockDMMFField({
          name: 'id',
          type: 'String',
          hasDefaultValue: true,
          default: { name: 'cuid', args: [] },
        }),
        createMockDMMFField({
          name: 'createdAt',
          type: 'DateTime',
          hasDefaultValue: true,
          default: { name: 'now', args: [] },
        }),
      ],
    });

    const dmmf = createMockDMMF();
    const config = { ...defaultConfig, createZodSchemas: false, mockDateRange: 30 };

    const result = generateMockFactory(model, config, dmmf);

    // CUIDはインライン関数として生成される
    expect(result).toContain('(() => { const t = Date.now().toString(36)');
    expect(result).toContain('createdAt: new Date()');
  });

  it('@mockアノテーションをデフォルト値より優先する', () => {
    const model = createMockDMMFModel({
      name: 'User',
      fields: [
        createMockDMMFField({
          name: 'role',
          type: 'String',
          hasDefaultValue: true,
          default: 'USER',
          documentation: '@mock "ADMIN"',
        }),
      ],
    });

    const dmmf = createMockDMMF();
    const config = { ...defaultConfig, createZodSchemas: false, mockDateRange: 30 };

    const result = generateMockFactory(model, config, dmmf);

    expect(result).toContain('role: "ADMIN"');
    expect(result).not.toContain("role: 'USER'");
  });

  it('デフォルトやアノテーションがない場合はセマンティック分析にフォールバックする', () => {
    const model = createMockDMMFModel({
      name: 'User',
      fields: [
        createMockDMMFField({
          name: 'email',
          type: 'String',
          hasDefaultValue: false,
        }),
      ],
    });

    const dmmf = createMockDMMF();
    const config = { ...defaultConfig, createZodSchemas: false, mockDateRange: 30 };

    const result = generateMockFactory(model, config, dmmf);

    expect(result).toContain('email: faker.internet.email()');
  });

  it('dbgeneratedをセマンティック分析にフォールバックして処理する', () => {
    const model = createMockDMMFModel({
      name: 'User',
      fields: [
        createMockDMMFField({
          name: 'sequenceId',
          type: 'Int',
          hasDefaultValue: true,
          default: {
            name: 'dbgenerated',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            args: ['nextval("user_sequence")'] as readonly any[],
          },
        }),
      ],
    });

    const dmmf = createMockDMMF();
    const config = { ...defaultConfig, createZodSchemas: false, mockDateRange: 30 };

    const result = generateMockFactory(model, config, dmmf);

    // Should fall back to generic Int generation
    expect(result).toContain('sequenceId: faker.number.int({ min: 1, max: 1000 })');
  });
});
