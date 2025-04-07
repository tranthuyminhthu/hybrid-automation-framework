Feature: UI validation for Buzz page

  Scenario: Check if the "Post" button is displayed
    Given the user is on the "Buzz" page
    Then the "Post" button should be visible 