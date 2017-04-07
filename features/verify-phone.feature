Feature: Verify phone
  In order to set up profile
  As a pioneer
  I want to verify my phone
  So that I can continue to setup profile

  Background: 
    Given I have opened the UR app
    And I have agreed to the terms and conditions
    
  @PhoneNumberScreenScenario
  Scenario: Phone number screen
    Then I should be on the 'phone number' screen
    And I should see a message informing me 'confirm country'
    And I should see a message informing me 'enter phone number'
    And I should see a 'country select' field
    And I should see 'United States' in the 'country select' field
    And I should see a 'phone number' field
    And I should see a 'done' button
    And I should see the 'done' button is 'disabled'

  @CountrySelectScenario
  Scenario: Country select
    When I press the 'country select' field
    Then I should see a list of countries with area codes

  @EnterInvalidPhoneNumberScenario
  Scenario: Enter invalid phone number
    Given I have selected 'United States' from the 'country' select
    When I enter an invalid mobile number
    Then I should see the 'phone number' field is 'invalid'

  @EnterValidPhoneNumberScenario
  Scenario: Enter valid phone number
    Given I have selected 'United States' from the 'country' select
    When I enter a valid mobile number
    Then I should see the 'phone number' field is 'valid'
    And I should see the 'done' button is 'enabled'

  @SubmitValidPhoneNumberScenario
  Scenario: Submit valid phone number
    Given I have entered valid phone number
    When I press the 'done' button
    Then I should see a 'please wait' modal
    And I should be on the 'verification code' screen
    And I should see a message informing me 'verification code sent via sms'
    And I should see a message informing me 'enter verification code'
    And I should see a 'verification code' field
    And I should see a 'resend verification code' link
    And I should see a 'done' button
    And I should see the 'done' button is 'disabled'

  Scenario: Submit valid phone number - API Unavailable (TODO)

  @ResendVerificationCodeScenario
  Scenario: Resend verification code
    Given I have submitted valid phone number
    When I press the 'resend verification code' link
    Then I should be on the 'phone number' screen

  Scenario: Submit invalid verification code - API Unavailable (TODO)

  @EnterVerificationCodeScenario
  Scenario: Enter verification code
    Given I have submitted valid phone number
    When I enter a verification code
    Then I should see the 'done' button is 'enabled'

  @SubmitInvalidVerificationCodeScenario
  Scenario: Submit invalid verification code
    Given I have submitted valid phone number
    When I enter an invalid verification code
    And I press the 'done' button
    Then I should see a 'please wait' modal
    And I should see a message informing me 'invalid verification code'

  Scenario: Submit valid verification code - API Unavailable (TODO)

  @SubmitValidVerificationCodeScenario
  Scenario: Submit valid verification code
    Given I have submitted valid phone number
    When I enter a valid verification code
    And I press the 'done' button
    Then I should see a 'please wait' modal
    And I shoud be on the 'verify identity consent' screen
    And I should see a message informing me 'give ur permission to share identity with trulioo'
    And I should see a 'not now' button
    And I should see a 'yes' button
