export interface GeneratorConfig {
  createZodSchemas: boolean;
  useMultipleFiles: boolean;
  writeBarrelFiles: boolean;
  createInputTypes: boolean;
  createModelTypes: boolean;
  createPartialTypes: boolean;
  useDefaultValidators: boolean;
  coerceDate: boolean;

  createMockFactories: boolean;
  mockDataLocale: string;
  mockSeed?: number;
  mockDateRange: number;
  createRelationMocks: boolean;
  relationMaxDepth: number;
  modelDepths?: Record<string, number>;
  mockOutputSeparate: boolean;
}

export const defaultConfig: GeneratorConfig = {
  createZodSchemas: true,
  useMultipleFiles: false,
  writeBarrelFiles: true,
  createInputTypes: true,
  createModelTypes: true,
  createPartialTypes: false,
  useDefaultValidators: true,
  coerceDate: true,

  createMockFactories: true,
  mockDataLocale: 'en',
  mockSeed: undefined,
  mockDateRange: 30,
  createRelationMocks: true,
  relationMaxDepth: 4,
  mockOutputSeparate: false,
};
