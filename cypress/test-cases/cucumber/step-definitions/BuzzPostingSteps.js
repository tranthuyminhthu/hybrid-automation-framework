import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { LoginPageAction } from '../../../pages/page-actions/orange-hrm-login-action/LoginPageAction';
import { BuzzPageAction } from '../../../pages/page-actions/orange-hrm-buzz-action/BuzzPageAction';
import { HomeManagementAction} from '../../../pages/page-actions/orange-hrm-home-action/HomeManagementAction';

const LOGIN_PAGE_ACTION = new LoginPageAction();
const BUZZ_PAGE = new BuzzPageAction();
const HOME_PAGE = new HomeManagementAction();
const TEXT = "Hello world!"

Given('that the user is logged in as Admin', () => {
  cy.fixture("credential").then((data) => {
    const username = data.username;
    const password = data.password;
    cy.visitURLSuccessfully();
    LOGIN_PAGE_ACTION.typeUserName(username);
    LOGIN_PAGE_ACTION.typePassword(password);
    LOGIN_PAGE_ACTION.clickOnLoginButton();
    });
});

Given('the user is on the Buzz page', () => {
  HOME_PAGE.clickOnBuzzOption();

});

When('the user enters text into the input field', () => {
  BUZZ_PAGE.enterTextIntoField(TEXT)
  })

When('clicks the "Post" button', () => {
  BUZZ_PAGE.clickPostButton()
  
});

Then('a new post should appear at the top of the Buzz Newsfeed', () => {
  BUZZ_PAGE.postShouldBeDisplayAtTheTopNewFeed();  
});