import { defineConfig } from 'vitest/config';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dts from 'vite-plugin-dts';
import * as path from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/ui-kit-react',

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
      aliasesExclude: [/@ts3d-hoops\/ui-kit.*/],
    }),
  ],

  build: {
    outDir: '../../staging/packages/ui-kit-react',
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
      external: ['@ts3d-hoops/ui-kit', /lit.*/, '@lit/react', 'react'],
      output: {
        inlineDynamicImports: false,
        assetFileNames: () => {
          return '[name][extname]';
        },
        entryFileNames: () => {
          return '[name].js';
        },
        preserveModules: true,
        preserveModulesRoot: `packages/ui-kit-react/src/`,
      },
      preserveEntrySignatures: 'strict',
    },
  },
});
