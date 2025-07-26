import { GeneratorOptions, DMMF } from '@prisma/generator-helper';
import * as fs from 'fs/promises';
import * as path from 'path';
import { GeneratorConfig } from '../config/types';
import { generateZodSchema } from '../../templates/zodSchema';
import { generateMockFactory } from '../../templates/mockFactory';

export async function generateMultipleFiles(
  options: GeneratorOptions,
  config: GeneratorConfig,
  outputDir: string
): Promise<void> {
  // Create subdirectories
  const schemasDir = path.join(outputDir, 'schemas');
  const mocksDir = path.join(outputDir, 'mocks');

  if (config.createZodSchemas) {
    await fs.mkdir(schemasDir, { recursive: true });
  }

  if (config.createMockFactories) {
    await fs.mkdir(mocksDir, { recursive: true });
  }

  const exports: string[] = [];

  // Generate files for each model
  for (const model of options.dmmf.datamodel.models) {
    const modelNameLower = model.name.toLowerCase();

    // Generate schema file
    if (config.createZodSchemas) {
      const schemaContent = generateSchemaFile(model, config);
      const schemaPath = path.join(schemasDir, `${modelNameLower}.ts`);
      await fs.writeFile(schemaPath, schemaContent, 'utf-8');
      exports.push(`export * from './schemas/${modelNameLower}';`);
    }

    // Generate mock file
    if (config.createMockFactories) {
      const mockContent = generateMockFile(model, config, options.dmmf);
      const mockPath = path.join(mocksDir, `${modelNameLower}.mock.ts`);
      await fs.writeFile(mockPath, mockContent, 'utf-8');
      exports.push(`export * from './mocks/${modelNameLower}.mock';`);
    }
  }

  // Generate barrel file
  if (config.writeBarrelFiles && exports.length > 0) {
    const indexPath = path.join(outputDir, 'index.ts');
    await fs.writeFile(indexPath, exports.join('\n') + '\n', 'utf-8');
  }
}

function generateSchemaFile(model: DMMF.Model, config: GeneratorConfig): string {
  let content = "import { z } from 'zod';\n\n";
  content += generateZodSchema(model, config);
  return content;
}

function generateMockFile(model: DMMF.Model, config: GeneratorConfig, dmmf: DMMF.Document): string {
  let content = "import { faker } from '@faker-js/faker';\n";

  if (config.createZodSchemas) {
    content += `import { ${model.name}, ${model.name}Schema } from '../schemas/${model.name.toLowerCase()}';\n`;
  }

  content += '\n';
  content += generateMockFactory(model, config, dmmf);
  return content;
}
