#!/usr/bin/env node

import { generatorHandler } from '@prisma/generator-helper';
import { generate } from './generator-handler';

generatorHandler({
  onManifest() {
    return {
      defaultOutput: './generated',
      prettyName: 'Prisma Zod Mock Generator',
      requiresGenerators: [],
    };
  },
  onGenerate: generate,
});
