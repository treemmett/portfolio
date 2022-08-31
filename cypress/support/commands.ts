/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare namespace Cypress {
  interface Chainable {
    login(username?: string): Chainable;
  }
}

Cypress.Commands.add('login', (username = 'treemmett') => {
  cy.visit('/');
  cy.window().then((win) => {
    cy.stub(win, 'open').as('windowOpen').returns({ closed: true });
  });
  cy.intercept('/api/login').as('login');
  cy.get('[data-testid=login]').click();
  cy.get('@windowOpen').should(
    'be.calledWithMatch',
    /https:\/\/github.com\/login\/oauth\/authorize\?client_id=/
  );
  cy.window().then((win) => {
    win.postMessage({
      payload: username,
      type: 'OAUTH_CODE',
    });
  });

  cy.wait('@login');
});
