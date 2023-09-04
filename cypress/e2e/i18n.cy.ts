/* cspell:disable */

describe('locales', () => {
  it('displays german', () => {
    cy.visit('/de');
    cy.contains('Hallo, ich bin Tregan');
  });

  it('displays french', () => {
    cy.visit('/fr');
    cy.contains("Salut, je m'appelle Tregan");
  });

  it('displays estonian', () => {
    cy.visit('/et');
    cy.contains('Tere, ma olen Tregan');
  });

  it('displays swedish', () => {
    cy.visit('/sv');
    cy.contains('Hej, jag heter Tregan');
  });
});
