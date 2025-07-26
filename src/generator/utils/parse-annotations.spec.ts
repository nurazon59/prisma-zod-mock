import { describe, it, expect } from 'vitest';
import { parseZodMockAnnotation, generateMockExpression } from './parse-annotations';
import { createMockDMMFField } from '../../../tests/test-helpers';

describe('parseZodMockAnnotation', () => {
  describe('Faker expressions', () => {
    it('should parse @mock faker.* expressions', () => {
      const field = createMockDMMFField({
        documentation: '@mock faker.internet.email()',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'faker',
        value: 'faker.internet.email()',
      });
    });

    it('should parse complex faker expressions', () => {
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

  describe('Fixed values', () => {
    it('should parse string fixed values', () => {
      const field = createMockDMMFField({
        documentation: '@mock "USER"',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'fixed',
        value: '"USER"',
      });
    });

    it('should parse numeric fixed values', () => {
      const field = createMockDMMFField({
        documentation: '@mock 42',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'fixed',
        value: '42',
      });
    });

    it('should parse boolean fixed values', () => {
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

  describe('Range values', () => {
    it('should parse @mock.range()', () => {
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

    it('should handle spaces in range', () => {
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

  describe('Pattern values', () => {
    it('should parse @mock.pattern() with double quotes', () => {
      const field = createMockDMMFField({
        documentation: '@mock.pattern("[A-Z]{3}-[0-9]{4}")',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'pattern',
        pattern: '[A-Z]{3}-[0-9]{4}',
      });
    });

    it('should parse @mock.pattern() with single quotes', () => {
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

  describe('Enum values', () => {
    it('should parse @mock.enum()', () => {
      const field = createMockDMMFField({
        documentation: '@mock.enum("red", "blue", "green")',
      });

      const result = parseZodMockAnnotation(field);
      expect(result).toEqual({
        type: 'enum',
        options: ['red', 'blue', 'green'],
      });
    });

    it('should handle mixed quotes', () => {
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


  it('should return null when no documentation', () => {
    const field = createMockDMMFField({
      documentation: undefined,
    });

    const result = parseZodMockAnnotation(field);
    expect(result).toBeNull();
  });

  it('should return null when no annotation', () => {
    const field = createMockDMMFField({
      documentation: 'This is just a regular documentation',
    });

    const result = parseZodMockAnnotation(field);
    expect(result).toBeNull();
  });
});

describe('generateMockExpression', () => {
  it('should generate faker expression', () => {
    const annotation = { type: 'faker' as const, value: 'faker.internet.email()' };
    const field = createMockDMMFField({ type: 'String' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe('faker.internet.email()');
  });

  it('should generate fixed value expression', () => {
    const annotation = { type: 'fixed' as const, value: '"USER"' };
    const field = createMockDMMFField({ type: 'String' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe('"USER"');
  });

  it('should generate int range expression', () => {
    const annotation = { type: 'range' as const, min: 18, max: 100 };
    const field = createMockDMMFField({ type: 'Int' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe('faker.number.int({ min: 18, max: 100 })');
  });

  it('should generate float range expression', () => {
    const annotation = { type: 'range' as const, min: 0, max: 100 };
    const field = createMockDMMFField({ type: 'Float' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe('faker.number.float({ min: 0, max: 100 })');
  });

  it('should generate pattern expression', () => {
    const annotation = { type: 'pattern' as const, pattern: '[A-Z]{3}' };
    const field = createMockDMMFField({ type: 'String' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe("faker.helpers.fromRegExp('[A-Z]{3}')");
  });

  it('should generate enum expression', () => {
    const annotation = { type: 'enum' as const, options: ['red', 'blue', 'green'] };
    const field = createMockDMMFField({ type: 'String' });

    const result = generateMockExpression(annotation, field);
    expect(result).toBe("faker.helpers.arrayElement(['red', 'blue', 'green'])");
  });
});