import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as path from 'path';
import dts from 'vite-plugin-dts';

export default {
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/ui-kit',

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
      copyDtsFiles: true,
    }),
  ],

  build: {
    outDir: '../../staging/packages/ui-kit',
    emptyOutDir: false,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [/lit.*/, /lit-html.*/, '@lit/context', '@lit/task'],
      output: {
        inlineDynamicImports: false,
        assetFileNames: () => {
          return '[name][extname]';
        },
        entryFileNames: () => {
          return '[name].js';
        },
        preserveModules: true,
        preserveModulesRoot: `packages/ui-kit/src/`,
      },
      preserveEntrySignatures: 'strict',
    },
  },
  test: {
    reporters: ['verbose', 'junit'],
    outputFile: '../../packages/ui-kit/ui-kit_unit.xml',
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/*.stories.ts'],
      include: ['src/**/*.ts'],
      reportsDirectory: '../../coverage/packages/ui-kit',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 59,
        functions: 68,
        branches: 81,
        statements: 59,
        autoUpdate: true,
      },
    },
  },
};
