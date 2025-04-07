Feature: Buzz Posting
  As a user of OrangeHRM,
  I want to be able to post updates in the Buzz feature
  so that I can share information with my colleagues.

  Scenario: Posting a text update
    Given that the user is logged in as Admin
    Given the user is on the Buzz page
    When the user enters text into the input field
    When clicks the "Post" 
    Then a new post should appear at the top of the Buzz Newsfeed