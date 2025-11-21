import { defineConfig } from 'cypress'
import { BASE_URL } from './tests/constants.js'

export default defineConfig({
  // currently not needed
  component: {

    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },

  e2e: {
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: BASE_URL,
    screenshotOnRunFailure: false,
  },
})
