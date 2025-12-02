describe('Next.js App Router - llms.txt', () => {
  it('should load the homepage', () => {
    cy.visit('/');
    cy.contains('To get started, edit the page.tsx file.');
  });

  it('should serve llms.txt at root', () => {
    cy.request('/llms.txt').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.include('text/markdown');
      expect(response.body).to.include('# llms.txt');
    });
  });
});
