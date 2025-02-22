/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { config } from 'dotenv'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    env: {
      ...config().parsed,
    },
    setupFiles: [
      './test/setup.ts'
    ],
    include: ['**/*.test.{ts,tsx}'],
    reporters: ['verbose']
    // browser: {
    //   provider: 'playwright',
    //   enabled: true,
    //   instances: [
    //     { browser: 'chromium', },
    //   ]
    // },
  },
  define: {
    'process.env': JSON.stringify(config().parsed),
  },
})