describe('test llms.txt', () => {
  it('should load the llms.txt', () => {
    cy.request('/llms.txt').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.include('text/markdown');
      expect(response.body).to.include('# DEFAULT CONFIG: next-llms-txt app-router-test-server');
      expect(response.body).to.include("> DEFAULT CONFIG: This is a test server for next-llms-txt's app router tests");
      // test for pages section
      expect(response.body).to.include("/both-exports):");
      expect(response.body).to.include("/metadata-only):");
    });
  });

  // it('should serve llms.txt at root', () => {
  //   cy.request('/llms.txt').then((response) => {
  //     expect(response.status).to.eq(200);
  //     expect(response.headers['content-type']).to.include('text/markdown');
  //     expect(response.body).to.include('# llms.txt');
  //   });
  // });
});
