Feature: Terms and conditions
  In order to continue to web app
  As a pioneer
  I want to accept terms and conditions
  So that I can continue

  Background:
    Given I have opened the UR app
  
  @FirstTimeHomeScreenScenario
  Scenario: First time home screen
    Then I should be on the 'first time home' screen
    And I should see a 'terms and conditions' link
    And I should see a 'agree & continue' button
    And I should see a message informing me 'click the agree & continue button to agree to the terms and conditions'

  @OpenTermsAndConditionsScenario
  Scenario: Open terms and conditions
    When I press the 'terms and conditions' link
    Then I should be on the 'terms and conditions' modal
    And I should see the terms and conditions
    And I should see a modal 'done' button

  @ExitTermsAndConditionsScenario
  Scenario: Exit terms and conditions
    Given I have opened the terms and conditions
    When I click the 'done' button
    Then I should be on the 'first time home' screen

  @AgreeAndContinueScenario
  Scenario: Agree and continue
    When I press the 'agree & continue' button
    Then I should be on the 'phone number' screen
