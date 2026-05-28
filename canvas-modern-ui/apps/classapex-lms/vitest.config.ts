import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  define: {
    'process.env': '{}',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    pool: 'vmThreads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    exclude: ['node_modules', 'dist', '**/*.test.mjs', '**/*.spec.mjs'],
    server: {
      deps: {
        inline: [
          '@schoolapex/core',
          '@schoolapex/components'
        ]
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/__tests__/**',
        'src/pages/__tests__/**',
        'src/widgets/__tests__/**',
        'src/setupTests.ts',
        'src/**/*.test.tsx',
        'src/**/*.test.ts',
        'src/**/*.test.mjs',
        '**/*.d.ts',
        'vite.config.ts',
        'vitest.config.ts',
        '**/*.config.*',
      ],
    },
  },
});
