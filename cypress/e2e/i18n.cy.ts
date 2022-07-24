/* cspell:dictionaries fr-fr, de-de */

describe('locales', () => {
  it('displays german', () => {
    cy.visit('/de');
    cy.contains('Hallo, ich bin Tregan');
  });

  it('displays french', () => {
    cy.visit('/fr');
    cy.contains("Salut, je m'appelle Tregan");
  });
});
