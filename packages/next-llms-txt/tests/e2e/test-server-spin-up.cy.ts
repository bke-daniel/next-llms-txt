describe('basic test setup', () => {
  it('should properly spin up the server', () => {
    // Start from the index page
    cy.visit('/')
    cy.find('next-llms-txt test-server').should('exist')
  })
})
