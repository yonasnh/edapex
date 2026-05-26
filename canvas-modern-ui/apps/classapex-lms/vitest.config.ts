import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    define: {
      'process.env': '{}',
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/setupTests.ts'],
      // Use forks pool instead of threads to reduce per-worker memory overhead
      pool: 'forks',
      poolOptions: {
        forks: {
          // Limit to 2 concurrent worker processes to avoid OOM
          maxForks: 2,
          minForks: 1,
        },
      },
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
          '**/*.d.ts',
          'vite.config.ts',
          'vitest.config.ts',
          '**/*.config.*',
        ],
      },
    },
  })
);
