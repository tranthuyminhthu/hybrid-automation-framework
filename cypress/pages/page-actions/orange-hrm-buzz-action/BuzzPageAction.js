import { BuzzPageElement } from "../../page-elements/orange-hrm-buzz-element/BuzzPageElement";

const BUZZ_PAGE_ELEMENT = new BuzzPageElement();

export class BuzzPageAction {
  enterTextIntoField(text) {
    cy.get(BUZZ_PAGE_ELEMENT.TEXT_INPUT).type(text);
  }

  clickPostButton() {
    cy.contains("button", "Post").click();
  }

  postShouldBeDisplayAtTheTopNewFeed(text) {
    cy.get(BUZZ_PAGE_ELEMENT.POST_BODY).first().should("contain", text);
  }
}
