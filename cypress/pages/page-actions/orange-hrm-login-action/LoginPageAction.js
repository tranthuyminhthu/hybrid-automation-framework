
import { LoginPageElement } from "../../page-elements/orange-hrm-login-element/LoginPageElement";

const LOGIN_PAGE_ELEMENT = new LoginPageElement();

export class LoginPageAction {
  getUserName() {
    return cy.get(LOGIN_PAGE_ELEMENT.USER_NAME_SELECTOR);
  }

  getPassword() {
    return cy.get(LOGIN_PAGE_ELEMENT.PASS_WORD_SELECTOR);
  }

  getLoginButton() {
    return cy.get(LOGIN_PAGE_ELEMENT.LOGIN_BUTTON_SELECTOR);
  }

  typeUserName(userName) {
    console.log("username", this.getUserName());
    this.getUserName().type(userName);
  }

  typePassword(password) {
    this.getPassword().type(password);
  }

  clickOnLoginButton() {
    this.getLoginButton().click();
  }
}
