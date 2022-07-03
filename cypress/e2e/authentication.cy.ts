beforeEach(() => {
  cy.visit('/');
});

describe('authentication', () => {
  it('should authenticate with github', () => {
    cy.login('treemmett');
    cy.contains('Welcome back');
  });
});
