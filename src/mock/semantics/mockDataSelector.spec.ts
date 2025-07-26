import { describe, it, expect, vi } from 'vitest';
import { faker } from '@faker-js/faker';
import { selectMockData, MockOptions } from './mockDataSelector';

vi.mock('@faker-js/faker', () => ({
  faker: {
    seed: vi.fn(),
    setLocale: vi.fn(),
    internet: {
      email: vi.fn(() => 'test@example.com'),
      url: vi.fn(() => 'https://example.com'),
    },
    person: {
      firstName: vi.fn(() => 'John'),
      lastName: vi.fn(() => 'Doe'),
      fullName: vi.fn(() => 'John Doe'),
    },
    phone: {
      number: vi.fn(() => '+1234567890'),
    },
    location: {
      streetAddress: vi.fn(() => '123 Main St'),
      city: vi.fn(() => 'New York'),
      zipCode: vi.fn(() => '10001'),
      country: vi.fn(() => 'United States'),
    },
    lorem: {
      paragraph: vi.fn(() => 'Lorem ipsum dolor sit amet'),
      sentence: vi.fn(() => 'Lorem ipsum'),
    },
    date: {
      recent: vi.fn(() => new Date('2024-01-01')),
      past: vi.fn(() => new Date('2020-01-01')),
    },
    image: {
      url: vi.fn(() => 'https://example.com/image.jpg'),
      avatar: vi.fn(() => 'https://example.com/avatar.jpg'),
    },
    commerce: {
      price: vi.fn(() => '99.99'),
    },
    company: {
      name: vi.fn(() => 'Acme Corp'),
    },
    string: {
      alpha: vi.fn(() => 'abcdefghij'),
      alphanumeric: vi.fn(() => 'abc123def456'),
    },
    number: {
      int: vi.fn(
        ({ min = 1, max = 1000 } = {}) => Math.floor(Math.random() * (max - min + 1)) + min
      ),
      float: vi.fn(({ min = 0, max = 1000 } = {}) => Math.random() * (max - min) + min),
    },
    datatype: {
      boolean: vi.fn(() => true),
    },
  },
}));

describe('mockDataSelector', () => {
  describe('selectMockData', () => {
    it('should generate email when semantic type is email', () => {
      const result = selectMockData('email', 'String');
      expect(result).toBe('test@example.com');
      expect(faker.internet.email).toHaveBeenCalled();
    });

    it('should generate first name when semantic type is name and field contains first', () => {
      const result = selectMockData('name', 'String', 'firstName');
      expect(result).toBe('John');
      expect(faker.person.firstName).toHaveBeenCalled();
    });

    it('should generate last name when semantic type is name and field contains last', () => {
      const result = selectMockData('name', 'String', 'lastName');
      expect(result).toBe('Doe');
      expect(faker.person.lastName).toHaveBeenCalled();
    });

    it('should generate full name when semantic type is name without specific indicator', () => {
      const result = selectMockData('name', 'String', 'name');
      expect(result).toBe('John Doe');
      expect(faker.person.fullName).toHaveBeenCalled();
    });

    it('should generate phone number when semantic type is phone', () => {
      const result = selectMockData('phone', 'String');
      expect(result).toBe('+1234567890');
      expect(faker.phone.number).toHaveBeenCalled();
    });

    it('should generate street address when semantic type is address', () => {
      const result = selectMockData('address', 'String');
      expect(result).toBe('123 Main St');
      expect(faker.location.streetAddress).toHaveBeenCalled();
    });

    it('should generate city when semantic type is address and field contains city', () => {
      const result = selectMockData('address', 'String', 'city');
      expect(result).toBe('New York');
      expect(faker.location.city).toHaveBeenCalled();
    });

    it('should generate zip code when semantic type is address and field contains zip', () => {
      const result = selectMockData('address', 'String', 'zipCode');
      expect(result).toBe('10001');
      expect(faker.location.zipCode).toHaveBeenCalled();
    });

    it('should generate url when semantic type is url', () => {
      const result = selectMockData('url', 'String');
      expect(result).toBe('https://example.com');
      expect(faker.internet.url).toHaveBeenCalled();
    });

    it('should generate description when semantic type is description', () => {
      const result = selectMockData('description', 'String');
      expect(result).toBe('Lorem ipsum dolor sit amet');
      expect(faker.lorem.paragraph).toHaveBeenCalled();
    });

    it('should generate title when semantic type is title', () => {
      const result = selectMockData('title', 'String');
      expect(result).toBe('Lorem ipsum');
      expect(faker.lorem.sentence).toHaveBeenCalled();
    });

    it('should generate recent date when semantic type is date', () => {
      const result = selectMockData('date', 'DateTime');
      expect(result).toEqual(new Date('2024-01-01'));
      expect(faker.date.recent).toHaveBeenCalled();
    });

    it('should generate past date when semantic type is date and field contains birth', () => {
      const result = selectMockData('date', 'DateTime', 'birthDate');
      expect(result).toEqual(new Date('2020-01-01'));
      expect(faker.date.past).toHaveBeenCalled();
    });

    it('should generate image url when semantic type is image', () => {
      const result = selectMockData('image', 'String');
      expect(result).toBe('https://example.com/image.jpg');
      expect(faker.image.url).toHaveBeenCalled();
    });

    it('should generate avatar url when semantic type is image and field contains avatar', () => {
      const result = selectMockData('image', 'String', 'avatar');
      expect(result).toBe('https://example.com/avatar.jpg');
      expect(faker.image.avatar).toHaveBeenCalled();
    });

    it('should generate price when semantic type is price', () => {
      const result = selectMockData('price', 'Float');
      expect(result).toBe(99.99);
      expect(faker.commerce.price).toHaveBeenCalled();
    });

    it('should generate country when semantic type is country', () => {
      const result = selectMockData('country', 'String');
      expect(result).toBe('United States');
      expect(faker.location.country).toHaveBeenCalled();
    });

    it('should generate company name when semantic type is company', () => {
      const result = selectMockData('company', 'String');
      expect(result).toBe('Acme Corp');
      expect(faker.company.name).toHaveBeenCalled();
    });

    it('should respect min and max options for numbers', () => {
      const options: MockOptions = { min: 10, max: 20 };
      const result = selectMockData('unknown', 'Int', undefined, options);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(20);
    });

    it('should generate boolean for Boolean type', () => {
      const result = selectMockData('unknown', 'Boolean');
      expect(typeof result).toBe('boolean');
    });

    it('should generate integer for Int type', () => {
      const result = selectMockData('unknown', 'Int');
      expect(typeof result).toBe('number');
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should generate float for Float type', () => {
      const result = selectMockData('unknown', 'Float');
      expect(typeof result).toBe('number');
    });

    it('should generate bigint for BigInt type', () => {
      const result = selectMockData('unknown', 'BigInt');
      expect(typeof result).toBe('bigint');
    });

    it('should generate string for unknown semantic type with String type', () => {
      const result = selectMockData('unknown', 'String');
      expect(typeof result).toBe('string');
    });

    it('should generate date for DateTime type', () => {
      const result = selectMockData('unknown', 'DateTime');
      expect(result).toBeInstanceOf(Date);
    });

    it('should generate object for Json type', () => {
      const result = selectMockData('unknown', 'Json');
      expect(typeof result).toBe('object');
    });

    it('should throw error for unsupported field type', () => {
      expect(() => selectMockData('unknown', 'UnsupportedType' as string)).toThrow(
        'Unsupported field type: UnsupportedType'
      );
    });
  });
});
