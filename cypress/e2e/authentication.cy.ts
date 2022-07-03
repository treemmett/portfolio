beforeEach(() => {
  cy.visit('/');
});

describe('authentication', () => {
  it('should authenticate with github', () => {
    cy.login('treemmett');
    cy.contains('Welcome back');
    cy.get('[data-testid="new post"]');
  });

  it('should authenticate an unknown user, and not allow posting', () => {
    cy.login('bob');
    cy.contains('Welcome back');
    cy.get('[data-testid="new post"]').should('not.exist');
  });

  it('should persist credential across sessions', () => {
    cy.login('treemmett');
    cy.contains('Welcome back');
    cy.visit('/');
    cy.contains('Welcome back');
  });

  it('log user out', () => {
    cy.login('treemmett');
    cy.contains('Welcome back');
    cy.get('[data-testid="logout"]').click();
    cy.contains("Hi, I'm Tregan");
    cy.visit('/');
    cy.contains('Welcome back').should('not.exist');
  });
});
