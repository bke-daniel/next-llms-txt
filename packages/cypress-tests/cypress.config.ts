import { defineConfig } from 'cypress'
import { BASE_URL } from './tests/constants.js'

export default defineConfig({
  e2e: {
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: BASE_URL,
    screenshotOnRunFailure: false,
    video: false,
    supportFile: 'cypress/support/e2e.ts',
  },
})
