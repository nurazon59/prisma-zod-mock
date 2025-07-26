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

  // Add imports
  content += generateImports(config);
  content += '\n\n';

  // Generate Zod schemas
  if (config.createZodSchemas) {
    content += '// ===== Zod Schemas =====\n';
    for (const model of options.dmmf.datamodel.models) {
      content += generateZodSchema(model, config);
      content += '\n\n';
    }
  }

  // Generate mock factories
  if (config.createMockFactories) {
    content += '// ===== Mock Factories =====\n';
    for (const model of options.dmmf.datamodel.models) {
      content += generateMockFactory(model, config, options.dmmf);
      content += '\n\n';
    }
  }

  const outputPath = path.join(outputDir, 'index.ts');
  await fs.writeFile(outputPath, content, 'utf-8');
}

function generateImports(config: GeneratorConfig): string {
  const imports: string[] = [];

  if (config.createZodSchemas) {
    imports.push("import { z } from 'zod';");
  }

  if (config.createMockFactories) {
    imports.push("import { faker } from '@faker-js/faker';");
  }

  return imports.join('\n');
}
