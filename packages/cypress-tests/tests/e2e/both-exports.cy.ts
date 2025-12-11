describe('test page /both-exports', () => {
  it('should load the md file /both-exports.html.md', () => {
    cy.request('/both-exports.html.md').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.include('text/markdown');
      expect(response.body).to.include('# next-llms-txt app-router-test-server: /both-exports');
      expect(response.body).to.include("> LLMSTXT: This is the llmstxt export for next-llms-txt's app router tests");
    });
  });
});
