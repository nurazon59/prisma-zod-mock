import { describe, it, expect } from 'vitest';
import { parseZodMockAnnotation, generateMockExpression } from './parse-annotations';
import { createMockDMMFField } from '../../../tests/test-helpers';

describe('parseZodMockAnnotation', () => {
  describe('Faker式', () => {
    it('@mock faker.*式をパースする', () => {
      const field = createMockDMMFField({
        documentation: '@mock faker.internet.email()',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'faker',
        value: 'faker.internet.email()',
      });
    });

    it('複雑なfaker式をパースする', () => {
      const field = createMockDMMFField({
        documentation: '@mock faker.number.int({ min: 18, max: 100 })',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'faker',
        value: 'faker.number.int({ min: 18, max: 100 })',
      });
    });
  });

  describe('固定値', () => {
    it('文字列の固定値をパースする', () => {
      const field = createMockDMMFField({
        documentation: '@mock "USER"',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'fixed',
        value: '"USER"',
      });
    });

    it('数値の固定値をパースする', () => {
      const field = createMockDMMFField({
        documentation: '@mock 42',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'fixed',
        value: '42',
      });
    });

    it('真偽値の固定値をパースする', () => {
      const field = createMockDMMFField({
        documentation: '@mock true',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'fixed',
        value: 'true',
      });
    });
  });

  describe('範囲値', () => {
    it('@mock.range()をパースする', () => {
      const field = createMockDMMFField({
        documentation: '@mock.range(18, 100)',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'range',
        min: 18,
        max: 100,
      });
    });

    it('範囲内のスペースを処理する', () => {
      const field = createMockDMMFField({
        documentation: '@mock.range( 0 , 1000 )',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'range',
        min: 0,
        max: 1000,
      });
    });
  });

  describe('パターン値', () => {
    it('ダブルクォート付き@mock.pattern()をパースする', () => {
      const field = createMockDMMFField({
        documentation: '@mock.pattern("[A-Z]{3}-[0-9]{4}")',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'pattern',
        pattern: '[A-Z]{3}-[0-9]{4}',
      });
    });

    it('シングルクォート付き@mock.pattern()をパースする', () => {
      const field = createMockDMMFField({
        documentation: "@mock.pattern('[0-9]{3}-[0-9]{4}')",
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'pattern',
        pattern: '[0-9]{3}-[0-9]{4}',
      });
    });
  });

  describe('列挙値', () => {
    it('@mock.enum()をパースする', () => {
      const field = createMockDMMFField({
        documentation: '@mock.enum("red", "blue", "green")',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'enum',
        options: ['red', 'blue', 'green'],
      });
    });

    it('混合クォートを処理する', () => {
      const field = createMockDMMFField({
        documentation: "@mock.enum('Japan', \"USA\", 'UK')",
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'enum',
        options: ['Japan', 'USA', 'UK'],
      });
    });
  });

  it('ドキュメントがない場合はnullを返す', () => {
    const field = createMockDMMFField({
      documentation: undefined,
    });

    const result = parseZodMockAnnotation(field);
    expect(result).toBeNull();
  });

  it('アノテーションがない場合はnullを返す', () => {
    const field = createMockDMMFField({
      documentation: 'This is just a regular documentation',
    });

    const result = parseZodMockAnnotation(field);
    expect(result).toBeNull();
  });
});

describe('generateMockExpression', () => {
  it('faker式を生成する', () => {
    const annotation = { type: 'faker' as const, value: 'faker.internet.email()' };
    const field = createMockDMMFField({ type: 'String' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe('faker.internet.email()');
  });

  it('固定値式を生成する', () => {
    const annotation = { type: 'fixed' as const, value: '"USER"' };
    const field = createMockDMMFField({ type: 'String' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe('"USER"');
  });

  it('整数範囲式を生成する', () => {
    const annotation = { type: 'range' as const, min: 18, max: 100 };
    const field = createMockDMMFField({ type: 'Int' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe('faker.number.int({ min: 18, max: 100 })');
  });

  it('浮動小数点範囲式を生成する', () => {
    const annotation = { type: 'range' as const, min: 0, max: 100 };
    const field = createMockDMMFField({ type: 'Float' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe('faker.number.float({ min: 0, max: 100 })');
  });

  it('パターン式を生成する', () => {
    const annotation = { type: 'pattern' as const, pattern: '[A-Z]{3}' };
    const field = createMockDMMFField({ type: 'String' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe("faker.helpers.fromRegExp('[A-Z]{3}')");
  });

  it('列挙式を生成する', () => {
    const annotation = { type: 'enum' as const, options: ['red', 'blue', 'green'] };
    const field = createMockDMMFField({ type: 'String' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe("faker.helpers.arrayElement(['red', 'blue', 'green'])");
  });
});
