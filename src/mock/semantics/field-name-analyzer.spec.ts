import { describe, it, expect } from 'vitest';
import { analyzeFieldName } from './field-name-analyzer';

describe('fieldNameAnalyzer', () => {
  describe('analyzeFieldName', () => {
    it('should detect email fields when field name contains email', () => {
      expect(analyzeFieldName('email')).toBe('email');
      expect(analyzeFieldName('userEmail')).toBe('email');
      expect(analyzeFieldName('emailAddress')).toBe('email');
      expect(analyzeFieldName('contact_email')).toBe('email');
    });

    it('should detect email fields when field name contains mail', () => {
      expect(analyzeFieldName('mail')).toBe('email');
      expect(analyzeFieldName('mailAddress')).toBe('email');
    });

    it('should detect name fields when field name contains name', () => {
      expect(analyzeFieldName('name')).toBe('name');
      expect(analyzeFieldName('firstName')).toBe('name');
      expect(analyzeFieldName('lastName')).toBe('name');
      expect(analyzeFieldName('fullName')).toBe('name');
      expect(analyzeFieldName('user_name')).toBe('name');
    });

    it('should detect phone fields when field name contains phone or tel', () => {
      expect(analyzeFieldName('phone')).toBe('phone');
      expect(analyzeFieldName('phoneNumber')).toBe('phone');
      expect(analyzeFieldName('tel')).toBe('phone');
      expect(analyzeFieldName('telephone')).toBe('phone');
      expect(analyzeFieldName('mobile')).toBe('phone');
      expect(analyzeFieldName('mobilePhone')).toBe('phone');
    });

    it('should detect address fields when field name contains address related terms', () => {
      expect(analyzeFieldName('address')).toBe('address');
      expect(analyzeFieldName('street')).toBe('address');
      expect(analyzeFieldName('streetAddress')).toBe('address');
      expect(analyzeFieldName('city')).toBe('address');
      expect(analyzeFieldName('cityName')).toBe('address');
      expect(analyzeFieldName('zip')).toBe('address');
      expect(analyzeFieldName('zipCode')).toBe('address');
      expect(analyzeFieldName('postalCode')).toBe('address');
    });

    it('should detect url fields when field name contains url or website', () => {
      expect(analyzeFieldName('url')).toBe('url');
      expect(analyzeFieldName('websiteUrl')).toBe('url');
      expect(analyzeFieldName('website')).toBe('url');
      expect(analyzeFieldName('link')).toBe('url');
      expect(analyzeFieldName('homepage')).toBe('url');
    });

    it('should detect description fields when field name contains description related terms', () => {
      expect(analyzeFieldName('description')).toBe('description');
      expect(analyzeFieldName('desc')).toBe('description');
      expect(analyzeFieldName('bio')).toBe('description');
      expect(analyzeFieldName('about')).toBe('description');
      expect(analyzeFieldName('summary')).toBe('description');
    });

    it('should detect title fields when field name contains title related terms', () => {
      expect(analyzeFieldName('title')).toBe('title');
      expect(analyzeFieldName('heading')).toBe('title');
      expect(analyzeFieldName('subject')).toBe('title');
      expect(analyzeFieldName('headline')).toBe('title');
    });

    it('should detect date fields when field name contains date related terms', () => {
      expect(analyzeFieldName('date')).toBe('date');
      expect(analyzeFieldName('createdAt')).toBe('date');
      expect(analyzeFieldName('updatedAt')).toBe('date');
      expect(analyzeFieldName('birthDate')).toBe('date');
      expect(analyzeFieldName('publishedAt')).toBe('date');
      expect(analyzeFieldName('deletedAt')).toBe('date');
    });

    it('should detect image fields when field name contains image related terms', () => {
      expect(analyzeFieldName('image')).toBe('image');
      expect(analyzeFieldName('imageUrl')).toBe('image');
      expect(analyzeFieldName('avatar')).toBe('image');
      expect(analyzeFieldName('avatarUrl')).toBe('image');
      expect(analyzeFieldName('photo')).toBe('image');
      expect(analyzeFieldName('picture')).toBe('image');
    });

    it('should detect price fields when field name contains price related terms', () => {
      expect(analyzeFieldName('price')).toBe('price');
      expect(analyzeFieldName('cost')).toBe('price');
      expect(analyzeFieldName('amount')).toBe('price');
      expect(analyzeFieldName('total')).toBe('price');
      expect(analyzeFieldName('subtotal')).toBe('price');
      expect(analyzeFieldName('fee')).toBe('price');
    });

    it('should detect country fields when field name contains country', () => {
      expect(analyzeFieldName('country')).toBe('country');
      expect(analyzeFieldName('countryCode')).toBe('country');
      expect(analyzeFieldName('country_name')).toBe('country');
    });

    it('should detect company fields when field name contains company related terms', () => {
      expect(analyzeFieldName('company')).toBe('company');
      expect(analyzeFieldName('companyName')).toBe('company');
      expect(analyzeFieldName('organization')).toBe('company');
      expect(analyzeFieldName('employer')).toBe('company');
    });

    it('should be case insensitive when detecting field types', () => {
      expect(analyzeFieldName('EMAIL')).toBe('email');
      expect(analyzeFieldName('Email')).toBe('email');
      expect(analyzeFieldName('eMaIl')).toBe('email');
    });

    it('should return unknown when field name does not match any pattern', () => {
      expect(analyzeFieldName('foo')).toBe('unknown');
      expect(analyzeFieldName('bar')).toBe('unknown');
      expect(analyzeFieldName('data')).toBe('unknown');
      expect(analyzeFieldName('value')).toBe('unknown');
    });
  });
});
