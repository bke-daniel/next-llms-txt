describe('test llms.txt', () => {
  it('should load the llms.txt', () => {
    cy.request('/llms.txt').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.include('text/markdown');
      expect(response.body).to.include('# DEFAULT CONFIG: next-llms-txt app-router-test-server');
      expect(response.body).to.include("> DEFAULT CONFIG: This is a test server for next-llms-txt's app router tests");
      // list items point at the markdown variant, not the HTML page
      expect(response.body).to.include("/both-exports.html.md):");
      expect(response.body).to.include("/metadata-only.html.md):");
      expect(response.body).to.include("/index.html.md)");
    });
  });

  it('links only markdown variants that answer 200 with text/markdown', () => {
    cy.request('/llms.txt').then((response) => {
      const urls = [...(response.body as string).matchAll(/^- \[[^\]]+\]\(([^)]+)\)/gm)].map(m => m[1]);
      expect(urls).to.have.length.greaterThan(0);
      urls.forEach((url) => {
        expect(url).to.match(/\.html\.md$/);
        // `baseUrl` is not configured on the test server, so the links carry
        // the plugin's localhost fallback; request the path on this server.
        cy.request(new URL(url).pathname).then((page) => {
          expect(page.status).to.eq(200);
          expect(page.headers['content-type']).to.include('text/markdown');
        });
      });
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
