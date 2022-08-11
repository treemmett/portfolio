describe('posting', () => {
  it('should upload a photo', () => {
    const title = Math.random().toString().replace('0.', '');
    const location = Math.random().toString().replace('0.', '');

    cy.login();
    cy.get('[data-testid="new post"]').click();
    cy.location('search').should('contain', 'newPost=true');
    cy.get('label').should('contain', 'Pick an image');
    cy.get('form input[name="date"]').should('have.value', new Date().toISOString().split('T')[0]);

    cy.get('input[type="file"]').selectFile('cypress/fixtures/image.jpg', { force: true });
    cy.get('label').should('not.contain', 'Pick an image');
    cy.get('form input[name="title"]').type(title);
    cy.get('form input[name="location"]').type(location);

    cy.get('form button[type="submit"]').should('contain', 'Post');
    cy.get('form button[type="submit"]').click();
    cy.get('[data-testid="upload-manager"]').should('contain', 'Uploading');
    cy.get('[data-testid="upload-manager"]').should('contain', 'complete');

    cy.get('form').should('not.exist');
    cy.location('search').should('not.contain', 'newPost=true');

    cy.get('[data-testid="post"]').first().get('img').should('be.visible');
    cy.get('[data-testid="post"]').first().get('[data-testid="title"]').contains(title);
    cy.get('[data-testid="post"]').first().get('[data-testid="location"]').contains(location);
  });
});
