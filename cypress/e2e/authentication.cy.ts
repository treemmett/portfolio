beforeEach(() => {
  cy.visit('/');
});

describe('authentication', () => {
  it('should authenticate with github', () => {
    cy.intercept({ hostname: 'github.com', pathname: '/login/oauth/authorize' }, (req) =>
      req.redirect('http://localhost:3000/login?code=treemmett')
    );

    cy.intercept('/api/login').as('login');

    cy.get('[data-testid=login]').click();

    cy.wait(3000);

    cy.wait('@login');

    cy.contains('Welcome back');
  });
});
