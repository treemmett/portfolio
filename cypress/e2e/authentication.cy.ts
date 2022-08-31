beforeEach(() => {
  cy.visit('/');
});

describe('authentication', () => {
  it('should authenticate with github', () => {
    cy.login('treemmett');
    cy.contains('Welcome back');
    cy.get('[data-testid="new post"]');
  });

  it('should process github redirect callback', () => {
    cy.visit('/login?code=oh_hello');
    cy.window().then((win) => {
      // eslint-disable-next-line no-param-reassign
      win.opener = {
        postMessage: cy.stub().as('postMessage'),
      };
    });
    cy.get('@postMessage').should('be.called.with', {
      payload: 'oh_hello',
      type: 'OAUTH_CODE',
    });
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
