import { defineConfig } from '@playwright/test'

const ambienteTeste = {
  BALAIO_FAKE_INTERNAL_KEY: 'balaio-auth-e2e-chave-interna-apenas-para-testes-2026',
  AUTH_ALLOWED_ORIGINS: 'http://127.0.0.1:14321',
}

export default defineConfig({
  testDir: './tests/e2e', workers: 1, timeout: 60000,
  expect: { timeout: 20000 },
  use: { baseURL: 'http://127.0.0.1:14321', browserName: 'chromium', channel: 'chrome', headless: true },
  webServer: [
    { command: 'node tests/fixtures/servidores.cjs', url: 'http://127.0.0.1:18080/__test/saude', timeout: 60000, reuseExistingServer: false, env: ambienteTeste },
    {
      command: 'node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 -p 14321',
      url: 'http://127.0.0.1:14321/healthz', timeout: 120000, reuseExistingServer: false,
      env: {
        ...ambienteTeste,
        NEXT_TELEMETRY_DISABLED: '1', API_GATEWAY_URL: 'http://127.0.0.1:18080/api/v1',
        API_URL: 'http://127.0.0.1:13001/api/v1',
      },
    },
  ],
})
