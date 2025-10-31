import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [nxViteTsPaths()],
  test: {
    reporters: ['verbose', 'junit'],
    environment: 'jsdom',
    include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['dist', 'staging', 'node_modules'],
    outputFile: 'coverage-report/junit-report.xml',
    globals: true,
    setupFiles: ['@testing-library/jest-dom/vitest'],
    coverage: {
      provider: 'v8',
      clean: true,
      reportsDirectory: './coverage',
      // Ensure we include source files from all packages for consolidated coverage
      include: ['packages/**/src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        '**/*-e2e/**',
        '**/*.d.ts',
        '**/*.spec.ts',
        '**/*.stories.ts',
        '**/*.test.ts',
        '**/.nx/**',
        '**/.storybook/**',
        '**/coverage/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/staging/**',
        '**/tools/**',
        // Exclude build artifacts and generated files
        '**/lib/**',
        '**/esm/**',
        '**/cjs/**',
        '**/types/**',
      ],
      reporter: ['text', 'json', 'html'],
      all: true,
    },
  },
});
