import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// NPM build configuration: mirrors local config but resolves packages from node_modules
// Ensures static model files (.scs, .ktx2, etc.) in public/ are copied and served correctly.

export default defineConfig({
  root: __dirname,
  base: './',
  appType: 'mpa',
  publicDir: path.resolve(__dirname, 'public'),
  assetsInclude: ['**/*.scs'],
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@ts3d-hoops/sc-engine/engine.esm.wasm',
          dest: './',
        },
      ],
    }),
  ],
});
