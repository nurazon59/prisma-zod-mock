import { DMMF } from '@prisma/generator-helper';

export interface ZodMockAnnotation {
  type: 'custom' | 'faker' | 'fixed' | 'range' | 'pattern' | 'enum';
  value?: string;
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
}

export function parseZodMockAnnotation(field: DMMF.Field): ZodMockAnnotation | null {
  if (!field.documentation) {
    return null;
  }

  const lines = field.documentation.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('@mock faker.')) {
      const expression = trimmed.substring('@mock '.length).trim();
      return { type: 'faker', value: expression };
    }
    
    if (trimmed.startsWith('@mock ') && !trimmed.includes('faker.')) {
      const value = trimmed.substring('@mock '.length).trim();
      return { type: 'fixed', value };
    }
    
    const rangeMatch = trimmed.match(/@mock\.range\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rangeMatch) {
      return {
        type: 'range',
        min: parseInt(rangeMatch[1]),
        max: parseInt(rangeMatch[2])
      };
    }
    
    const patternMatch = trimmed.match(/@mock\.pattern\s*\(\s*["'](.+?)["']\s*\)/);
    if (patternMatch) {
      return { type: 'pattern', pattern: patternMatch[1] };
    }
    
    const enumMatch = trimmed.match(/@mock\.enum\s*\((.+)\)/);
    if (enumMatch) {
      const options = enumMatch[1]
        .split(',')
        .map(opt => opt.trim().replace(/["']/g, ''));
      return { type: 'enum', options };
    }
    
  }

  return null;
}

export function generateMockExpression(annotation: ZodMockAnnotation, field: DMMF.Field): string {
  switch (annotation.type) {
    case 'faker':
    case 'custom':
      return annotation.value || 'null';
      
    case 'fixed':
      return annotation.value || 'null';
      
    case 'range':
      if (field.type === 'Float' || field.type === 'Decimal') {
        return `faker.number.float({ min: ${annotation.min}, max: ${annotation.max} })`;
      }
      return `faker.number.int({ min: ${annotation.min}, max: ${annotation.max} })`;
      
    case 'pattern':
      return `faker.helpers.fromRegExp('${annotation.pattern}')`;
      
    case 'enum':
      if (annotation.options && annotation.options.length > 0) {
        const quotedOptions = annotation.options.map(opt => `'${opt}'`).join(', ');
        return `faker.helpers.arrayElement([${quotedOptions}])`;
      }
      return 'null';
      
    default:
      return 'null';
  }
}