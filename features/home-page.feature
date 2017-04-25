Feature: Home

  Background:
    Given I have opened the UR app
  
  @HomeScreenScenario
  Scenario: Home screen
    Then I should see a message informing me 'Welcome to UR'
    And I should see a 'sign up' button
    And I should see a 'sign in' button
