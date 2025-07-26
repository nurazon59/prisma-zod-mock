import { GeneratorOptions } from '@prisma/generator-helper';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parseConfig } from './config/parseConfig';
import { generateSingleFile } from './fileWriters/generateSingleFile';
import { generateMultipleFiles } from './fileWriters/generateMultipleFiles';

export async function generate(options: GeneratorOptions): Promise<void> {
  const outputDir = options.generator.output?.value;

  if (!outputDir) {
    throw new Error('No output was specified for Prisma Zod Mock Generator');
  }

  const config = parseConfig(options);
  const resolvedOutputDir = path.resolve(outputDir);

  // Create output directory
  await fs.mkdir(resolvedOutputDir, { recursive: true });

  if (config.useMultipleFiles) {
    await generateMultipleFiles(options, config, resolvedOutputDir);
  } else {
    await generateSingleFile(options, config, resolvedOutputDir);
  }

  console.log(`✔ Generated Prisma Zod Mock to ${resolvedOutputDir}`);
}
