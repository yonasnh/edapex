import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.turbo/**', '**/coverage/**'],
  },
  resolve: {
    alias: {
      '@schoolapex/core': resolve(__dirname, './packages/core/src'),
      '@schoolapex/components': resolve(__dirname, './packages/components/src'),
      'react': resolve(__dirname, './packages/core/node_modules/react'),
      'react-dom': resolve(__dirname, './packages/core/node_modules/react-dom'),
    },
  },
})
