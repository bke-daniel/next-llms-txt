import { nestedRoutes, routes } from '@test/constants'

describe('test page accessibility', () => {
  describe('test actual routes', () => {
    routes.forEach((path) => {
      it(`should be able to visit "${path}"`, () => {
        cy.visit(path)
        cy
          .get('h1')
          .contains('Page with')
      })
    })

    nestedRoutes.forEach((path) => {
      it(`should be able to visit "${path}"`, () => {
        cy.visit(path)
        cy
          .get('h1')
          .contains('Nested page with')
      })
    })
  })

  describe('test md routes', () => {
    routes.forEach((path) => {
      const mdPath = `${path}.html.md`
      it(`should be able to visit "${mdPath}"`, () => {
        // Start from the index page
        cy.request(mdPath).should((response) => {
          expect(response.status).to.eq(200)
          expect(response.headers['content-type']).to.eq('text/markdown; charset=utf-8')
          expect(response.body).to.include('# Page with')
        })
      })
    })
  })

  describe.skip('test nested md routes', () => {
    routes.forEach((path) => {
      const mdPath = `${path}.html.md`
      it(`should be able to visit "${mdPath}"`, () => {
        // Start from the index page
        cy.request(mdPath).should((response) => {
          expect(response.status).to.eq(200)
          expect(response.headers['content-type']).to.eq('text/markdown; charset=utf-8')
          expect(response.body).to.include('# Nested page with')
        })
      })
    })
  })

  describe('test /llms.txt', () => {
    it('should be able to visit "/llms.txt"', () => {
      cy.request('/llms.txt').should((response) => {
        expect(response.status).to.eq(200)
        expect(response.headers['content-type']).to.eq('text/markdown; charset=utf-8')
        expect(response.body)
          .to
          .include('# next-llms-txt test-server')
          .and
          .include('This is a test server for next-llms-txt\'s e2e tests')
      })
    })
  })
})
