Feature: Sign In
  
  Background: 
    Given I have opened the UR app
    And I have clicked Sign In button

  @FirstTimeSignInScreenScenario
  Scenario: First time sign in screen
    Then I should be on the first time sign in screen
    And I should see a 'terms and conditions' link
    And I should see a 'country select' field
    And I should see 'United States' in the 'country select' field
    And I should see a 'phone number' field
    And I should see a message informing me 'click agree & continue to accept the UR Technology'
    And I should see a 'agree & continue' button
    And I should see the 'agree & continue' button is 'disabled'

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
    Then I should be on the first time sign in screen

  @CountrySelectScenario
  Scenario: Country select
    When I press the 'country select' field
    Then I should see a list of countries with area codes

  @EnterInvalidPhoneNumberScenario
  Scenario: Enter invalid phone number
    Given I have selected 'United States' from the 'country' select
    When I enter an invalid mobile number
    Then I should see the 'phone number' field is 'invalid'
    And I should see the 'done' button is 'disabled'

  @EnterValidPhoneNumberScenario
  Scenario: Enter valid phone number
    Given I have selected 'United States' from the 'country' select
    When I enter a valid mobile number
    Then I should see the 'phone number' field is 'valid'
    And I should see the 'done' button is 'enabled'
