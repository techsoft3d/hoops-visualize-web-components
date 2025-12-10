import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

import dts from 'vite-plugin-dts';
import * as path from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/web-viewer-components',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      aliasesExclude: [
        /@ts3d-hoops\/common.*/,
        /@ts3d-hoops\/web-viewer.*/,
        /@ts3d-hoops\/ui-kit.*/,
      ],
      copyDtsFiles: true,
    }),
  ],

  build: {
    outDir: '../../staging/packages/web-viewer-components',
    emptyOutDir: false,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        /lit.*/,
        '@ts3d-hoops/common',
        '@ts3d-hoops/web-viewer',
        /@ts3d-hoops\/ui-kit.*/,
        '@lit/context',
        'color-string',
      ],
      output: {
        inlineDynamicImports: false,
        assetFileNames: () => {
          return '[name][extname]';
        },
        entryFileNames: () => {
          return '[name].js';
        },
        preserveModules: true,
        preserveModulesRoot: `packages/web-viewer-components/src/`,
      },
      preserveEntrySignatures: 'strict',
      treeshake: false,
    },
  },
  test: {
    reporters: ['verbose', 'junit'],
    outputFile: '../../packages/web-viewer-components/web-viewer-components_unit.xml',
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.stories.ts',
        'src/@types/**',
        'src/lib/testing/**',
        'src/stories/**',
        'src/mocks/**',
      ],
      include: ['src/**/*.ts'],
      reportsDirectory: '../../coverage/packages/web-viewer-components',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 55,
        functions: 77,
        branches: 85,
        statements: 55,
        autoUpdate: true,
      },
    },
  },
});
