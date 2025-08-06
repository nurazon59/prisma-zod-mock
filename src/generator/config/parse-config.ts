import { GeneratorOptions } from '@prisma/generator-helper';
import { GeneratorConfig, defaultConfig } from './types';

export function parseConfig(options: GeneratorOptions): GeneratorConfig {
  const config = { ...defaultConfig };

  const booleanOptions: (keyof GeneratorConfig)[] = [
    'createZodSchemas',
    'useMultipleFiles',
    'writeBarrelFiles',
    'createInputTypes',
    'createModelTypes',
    'createPartialTypes',
    'useDefaultValidators',
    'coerceDate',
    'createMockFactories',
    'createRelationMocks',
    'mockOutputSeparate',
  ];

  booleanOptions.forEach((key) => {
    const value = options.generator.config[key];
    if (value !== undefined) {
      (config[key as keyof GeneratorConfig] as boolean) = value === 'true';
    }
  });

  if (options.generator.config.mockDataLocale) {
    const locale = options.generator.config.mockDataLocale;
    if (typeof locale === 'string') {
      config.mockDataLocale = locale;
    }
  }

  if (options.generator.config.mockSeed) {
    const seed = options.generator.config.mockSeed;
    if (typeof seed === 'string') {
      config.mockSeed = parseInt(seed, 10);
    }
  }

  if (options.generator.config.mockDateRange) {
    const range = options.generator.config.mockDateRange;
    if (typeof range === 'string') {
      config.mockDateRange = parseInt(range, 10);
    }
  }

  if (options.generator.config.relationMaxDepth) {
    const depth = options.generator.config.relationMaxDepth;
    if (typeof depth === 'string') {
      config.relationMaxDepth = parseInt(depth, 10);
    }
  }

  if (options.generator.config.modelDepths) {
    const modelDepths = options.generator.config.modelDepths;
    if (typeof modelDepths === 'string') {
      try {
        config.modelDepths = JSON.parse(modelDepths);
      } catch (e) {
        console.warn('Failed to parse modelDepths JSON:', modelDepths);
      }
    }
  }

  return config;
}
