describe('Next.js App Router - llms.txt', () => {
  it('should load the homepage', () => {
    cy.visit('/');
    cy.contains('To get started, edit the page.tsx file.');
  });

  it('should serve llms.txt at root', () => {
    cy.request('/llms.txt').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.include('text/markdown');
      // Assert the llms.txt structure per the llmstxt.org spec rather than a
      // specific section name: an H1 title, plus at least one H2 "file-list"
      // section whose items are markdown links. Section names are arbitrary
      // per the spec, so we do not hard-code one (e.g. `## Pages`).
      const body = response.body as string;
      expect(body).to.match(/^# .+/m);
      expect(body).to.match(/^## .+/m);
      expect(body).to.match(/^- \[.+\]\(.+\)/m);
    });
  });
});
