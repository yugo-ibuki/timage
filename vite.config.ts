import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        background: './src/background/index.ts',
        content: './src/content/index.tsx',
        popup: './src/popup/main.tsx'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // background用のファイルは特別な処理
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          return '[name].js';
        },
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        format: 'es'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true
  },
  publicDir: 'public'
});