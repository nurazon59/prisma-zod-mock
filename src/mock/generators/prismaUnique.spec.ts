import { describe, it, expect, beforeEach } from 'vitest';
import { UniqueValueGenerator } from './prismaUnique';
import { createMockDMMFField } from '../../../tests/test-helpers';

describe('UniqueValueGenerator', () => {
  let generator: UniqueValueGenerator;

  beforeEach(() => {
    generator = new UniqueValueGenerator();
  });

  describe('generateUnique', () => {
    it('should generate unique values when called multiple times', () => {
      const field = createMockDMMFField({
        name: 'email',
        type: 'String',
      });

      const mockGenerator = () => `test${Math.random()}@example.com`;

      const values = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const value = generator.generateUnique(field, 'User', mockGenerator);
        values.add(value);
      }

      expect(values.size).toBe(10);
    });

    it('should use modelName and fieldName as key for tracking unique values', () => {
      const field1 = createMockDMMFField({
        name: 'email',
        type: 'String',
      });
      const field2 = createMockDMMFField({
        name: 'email',
        type: 'String',
      });

      let counter = 0;
      const mockGenerator = () => `test${counter++}@example.com`;

      const value1 = generator.generateUnique(field1, 'User', mockGenerator);
      const value2 = generator.generateUnique(field2, 'Post', mockGenerator);

      expect(value1).toBe('test0@example.com');
      expect(value2).toBe('test1@example.com');
    });

    it('should retry when generator produces duplicate value', () => {
      const field = createMockDMMFField({
        name: 'id',
        type: 'String',
      });

      let callCount = 0;
      const mockGenerator = () => {
        callCount++;
        return callCount <= 2 ? 'duplicate' : 'unique';
      };

      const value1 = generator.generateUnique(field, 'User', mockGenerator);
      const value2 = generator.generateUnique(field, 'User', mockGenerator);

      expect(value1).toBe('duplicate');
      expect(value2).toBe('unique');
      expect(callCount).toBe(3);
    });

    it('should throw error when max attempts reached', () => {
      const field = createMockDMMFField({
        name: 'id',
        type: 'String',
      });

      const mockGenerator = () => 'always-same';

      generator.generateUnique(field, 'User', mockGenerator);

      expect(() => {
        for (let i = 0; i < 1001; i++) {
          generator.generateUnique(field, 'User', mockGenerator);
        }
      }).toThrow('Failed to generate unique value for User.id after 1000 attempts');
    });

    it('should maintain separate unique sets for different fields', () => {
      const emailField = createMockDMMFField({
        name: 'email',
        type: 'String',
      });
      const usernameField = createMockDMMFField({
        name: 'username',
        type: 'String',
      });

      const value1 = generator.generateUnique(emailField, 'User', () => 'same-value');
      const value2 = generator.generateUnique(usernameField, 'User', () => 'same-value');

      expect(value1).toBe('same-value');
      expect(value2).toBe('same-value');
    });
  });

  describe('reset', () => {
    it('should clear all stored unique values', () => {
      const field = createMockDMMFField({
        name: 'email',
        type: 'String',
      });

      generator.generateUnique(field, 'User', () => 'value1');
      generator.generateUnique(field, 'User', () => 'value2');

      generator.reset();

      const value = generator.generateUnique(field, 'User', () => 'value1');
      expect(value).toBe('value1');
    });
  });

  describe('resetField', () => {
    it('should clear unique values for specific field', () => {
      const emailField = createMockDMMFField({
        name: 'email',
        type: 'String',
      });
      const usernameField = createMockDMMFField({
        name: 'username',
        type: 'String',
      });

      generator.generateUnique(emailField, 'User', () => 'email-value');
      generator.generateUnique(usernameField, 'User', () => 'username-value');

      generator.resetField('User', 'email');

      const emailValue = generator.generateUnique(emailField, 'User', () => 'email-value');
      expect(emailValue).toBe('email-value');

      expect(() => {
        generator.generateUnique(usernameField, 'User', () => 'username-value');
      }).toThrow();
    });
  });

  describe('getUsedValues', () => {
    it('should return all used values for a field', () => {
      const field = createMockDMMFField({
        name: 'email',
        type: 'String',
      });

      generator.generateUnique(field, 'User', () => 'email1@example.com');
      generator.generateUnique(field, 'User', () => 'email2@example.com');

      const usedValues = generator.getUsedValues('User', 'email');
      expect(usedValues).toEqual(new Set(['email1@example.com', 'email2@example.com']));
    });

    it('should return empty set for unused field', () => {
      const usedValues = generator.getUsedValues('User', 'nonexistent');
      expect(usedValues).toEqual(new Set());
    });
  });
});
