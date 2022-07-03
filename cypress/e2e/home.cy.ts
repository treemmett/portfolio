describe('home page', () => {
  it('should load the intro', () => {
    cy.visit('/');
    cy.contains("Hi, I'm Tregan");
  });
});
