import { DMMF } from '@prisma/generator-helper';

export class UniqueValueGenerator {
  private usedValues = new Map<string, Set<unknown>>();
  private readonly maxAttempts = 1000;

  generateUnique<T>(field: DMMF.Field, modelName: string, generator: () => T): T {
    const key = `${modelName}.${field.name}`;
    const usedSet = this.usedValues.get(key) || new Set();

    let value: T;
    let attempts = 0;

    do {
      value = generator();
      attempts++;

      if (attempts > this.maxAttempts) {
        throw new Error(
          `Failed to generate unique value for ${key} after ${this.maxAttempts} attempts`
        );
      }
    } while (usedSet.has(value));

    usedSet.add(value);
    this.usedValues.set(key, usedSet);

    return value;
  }

  reset(): void {
    this.usedValues.clear();
  }

  resetField(modelName: string, fieldName: string): void {
    const key = `${modelName}.${fieldName}`;
    this.usedValues.delete(key);
  }

  getUsedValues(modelName: string, fieldName: string): Set<unknown> {
    const key = `${modelName}.${fieldName}`;
    return this.usedValues.get(key) || new Set();
  }
}
