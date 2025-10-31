import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const engineCandidates = [
  '../../packages/sc-engine/public/engine.esm.wasm',
  '../../node_modules/@ts3d-hoops/sc-engine/engine.esm.wasm',
];

const engineSource = engineCandidates.find((candidate) =>
  fs.existsSync(path.resolve(__dirname, candidate)),
);

if (!engineSource) {
  console.warn('[demo] Skipping engine.esm.wasm copy; none of the expected sources were found.');
}

const staticCopyPlugin = engineSource
  ? viteStaticCopy({
      targets: [
        {
          src: engineSource,
          dest: './',
        },
      ],
    })
  : null;

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/demo',
  base: './',
  appType: 'mpa',

  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },

  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths(), ...(staticCopyPlugin ? [staticCopyPlugin] : [])],
  resolve: {
    alias: [
      {
        find: /^@ts3d-hoops\/web-viewer-components\/react$/,
        replacement: path.resolve(
          __dirname,
          '../../packages/web-viewer-components/src/lib/react.ts',
        ),
      },
    ],
  },
  build: {
    outDir: '../../dist/apps/demo',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
