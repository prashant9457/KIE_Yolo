import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiProxy = { target: 'http://127.0.0.1:8000', changeOrigin: true };

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(
      ['/extract', '/postprocess', '/health', '/stats', '/feedback'].map((path) => [
        path,
        apiProxy,
      ]),
    ),
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 30,
            },
            {
              name: 'motion',
              test: /node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/,
              priority: 20,
            },
            { name: 'vendor', test: /node_modules/, priority: 10 },
          ],
        },
      },
    },
  },
});
