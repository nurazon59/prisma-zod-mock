import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 60,
        statements: 80,
      },
      exclude: [
        'dist/**',
        'tests/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        'vitest.config.ts',
        'example/**',
        '**/bin.ts', // CLIエントリーポイントは除外
      ],
    },
  },
});
