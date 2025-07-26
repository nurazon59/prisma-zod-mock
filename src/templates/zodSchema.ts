import { DMMF } from '@prisma/generator-helper';
import { GeneratorConfig } from '../generator/config/types';

export function generateZodSchema(model: DMMF.Model, config: GeneratorConfig): string {
  let schema = `export const ${model.name}Schema = z.object({\n`;

  for (const field of model.fields) {
    if (field.kind === 'scalar') {
      schema += `  ${field.name}: ${generateFieldSchema(field, config)},\n`;
    }
  }

  schema += '});\n\n';
  schema += `export type ${model.name} = z.infer<typeof ${model.name}Schema>;`;

  return schema;
}

function generateFieldSchema(field: DMMF.Field, config: GeneratorConfig): string {
  let schema = '';

  switch (field.type) {
    case 'String':
      schema = 'z.string()';
      if (field.name === 'email' || field.name.toLowerCase().includes('email')) {
        schema += '.email()';
      }
      if (field.name === 'url' || field.name.toLowerCase().includes('url')) {
        schema += '.url()';
      }
      if (field.isId) {
        schema += '.cuid()';
      }
      break;

    case 'Int':
      schema = 'z.number().int()';
      break;

    case 'Float':
    case 'Decimal':
      schema = 'z.number()';
      break;

    case 'Boolean':
      schema = 'z.boolean()';
      break;

    case 'DateTime':
      schema = config.coerceDate ? 'z.coerce.date()' : 'z.date()';
      break;

    case 'Json':
      schema = 'z.unknown()';
      break;

    case 'BigInt':
      schema = 'z.bigint()';
      break;

    case 'Bytes':
      schema = 'z.instanceof(Buffer)';
      break;

    default:
      schema = 'z.unknown()';
  }

  if (field.isList) {
    schema = `z.array(${schema})`;
  }

  if (!field.isRequired) {
    schema += '.nullable()';
  }

  if (field.hasDefaultValue) {
    schema += '.optional()';
  }

  return schema;
}
