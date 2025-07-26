export type SemanticType =
  | 'email'
  | 'name'
  | 'phone'
  | 'address'
  | 'url'
  | 'description'
  | 'title'
  | 'date'
  | 'image'
  | 'price'
  | 'country'
  | 'company'
  | 'unknown';

interface PatternMapping {
  [key: string]: RegExp;
}

const patterns: PatternMapping = {
  email: /email|mail/i,
  phone: /phone|tel|mobile/i,
  address: /address|street|city|zip|postal/i,
  image: /image|avatar|photo|picture/i,
  url: /url|website|link|homepage/i,
  description: /description|desc|bio|about|summary/i,
  title: /title|heading|subject|headline/i,
  date: /date|createdAt|updatedAt|deletedAt|publishedAt|birthDate/i,
  price: /price|cost|amount|total|subtotal|fee/i,
  country: /country/i,
  company: /company|organization|employer/i,
  name: /name|firstName|lastName/i,
};

export function analyzeFieldName(fieldName: string): SemanticType {
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(fieldName)) {
      return type as SemanticType;
    }
  }

  return 'unknown';
}
