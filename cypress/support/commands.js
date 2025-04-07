import * as Contants from "../constant";

Cypress.Commands.add("visitURLSuccessfully", () => {
  cy.visit(Contants.URL); 
});

Cypress.Commands.add("loginSuccessWithRoleAdmin", () => {
  cy.visit(Contants.URL);  // Mở URL từ Contants.URL
  cy.get('input[name="username"]').type("Admin");
  cy.get('input[name="password"]').type("admin123");
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add("navigateToAdminPage", () => {
  cy.get('selector-to-check').should('be.visible').then(() => {
    HOME_PAGE_ACTION.clickOnAdminSelector();  
  });
});
