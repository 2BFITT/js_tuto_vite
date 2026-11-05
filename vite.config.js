import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Relative asset paths work on both GitHub project pages and custom domains.
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        tutorials: fileURLToPath(new URL('./tutorials.html', import.meta.url)),
      },
    },
  },
});
