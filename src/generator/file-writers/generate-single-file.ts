import { GeneratorOptions } from '@prisma/generator-helper';
import * as fs from 'fs/promises';
import * as path from 'path';
import { GeneratorConfig } from '../config/types';
import { generateZodSchema } from '../../templates/zod-schema';
import { generateMockFactory } from '../../templates/mock-factory';

export async function generateSingleFile(
  options: GeneratorOptions,
  config: GeneratorConfig,
  outputDir: string
): Promise<void> {
  let content = '';

  content += generateImports(config, options.dmmf);
  content += '\n\n';
  
  // Enum定義を先に生成
  if (config.createZodSchemas && options.dmmf.datamodel.enums.length > 0) {
    content += '// Enums\n';
    for (const enumDef of options.dmmf.datamodel.enums) {
      content += generateEnumDefinition(enumDef);
      content += '\n\n';
    }
  }

  if (config.createZodSchemas) {
    for (const model of options.dmmf.datamodel.models) {
      content += generateZodSchema(model, config);
      content += '\n\n';
    }
  }

  if (config.createMockFactories) {
    for (const model of options.dmmf.datamodel.models) {
      content += generateMockFactory(model, config, options.dmmf);
      content += '\n\n';
    }
  }

  const outputPath = path.join(outputDir, 'index.ts');
  await fs.writeFile(outputPath, content, 'utf-8');
}

function generateImports(config: GeneratorConfig, _dmmf: GeneratorOptions['dmmf']): string {
  const imports: string[] = [];

  if (config.createZodSchemas) {
    imports.push("import { z } from 'zod';");
  }

  if (config.createMockFactories) {
    imports.push("import { faker } from '@faker-js/faker';");
  }

  return imports.join('\n');
}

function generateEnumDefinition(enumDef: GeneratorOptions['dmmf']['datamodel']['enums'][0]): string {
  let content = `export const ${enumDef.name} = {\n`;
  
  for (const value of enumDef.values) {
    content += `  ${value.name}: '${value.name}',\n`;
  }
  
  content += '} as const;\n\n';
  content += `export type ${enumDef.name} = typeof ${enumDef.name}[keyof typeof ${enumDef.name}];`;
  
  return content;
}
