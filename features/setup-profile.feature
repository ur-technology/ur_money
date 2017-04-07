Feature: Setup profile
  In order to use UR Money app
  As a pioneer
  I want to setup my profile
  So that I can use UR Money app

  Background: 
    Given I have opened the UR app
    And I have agreed to the terms and conditions
    And I have submitted valid phone number
    And I have submitted valid verification code

  @VerifyIdentityConsentScreenScenario
  Scenario: Verify identity consent screen
    Then I shoud be on the 'verify identity consent' screen
    And I should see a message informing me 'give ur permission to share identity with trulioo'
    And I should see a 'not now' button
    And I should see a 'yes' button

  @OptOutOfIdentityVerificationScenario
  Scenario: Opt out of identity verification
    When I press the 'not now' button
    Then I should see a 'sign out' modal
    And I should see a message informing me 'are you sure you want to sign out'
    And I should see a 'cancel' button
    And I should see a 'yes' button

  @OptOutOfIdentityVerificationCancelModalScenario
  Scenario: Opt out - cancel modal
    Given I have opted out of identity verification
    When I press the 'cancel' button
    Then I should not see the 'sign out' modal

  @OptOutOfIdentityVerificationSignOutScenario
  Scenario: Opt out - sign out
    Given I have opted out of identity verification
    When I press the 'yes' button
    Then I should be on the 'first time home' screen
  
  @OptInIdentityVerificationScenario
  Scenario: Opt in
    When I press the 'yes' button
    Then I should be on the 'name and email' screen
    And I should see a 'first name' field
    And I should see a 'middle names' field
    And I should see a 'last name' field
    And I should see a 'email' field
    And I should see a 'done' button
    And I should see the 'done' button is 'disabled'

  Scenario: Field validations - (TODO)

  @EnterCorrectNameAndEmailScenario
  Scenario: Enter correct details
    Given I have opted in identity verification
    And I have entered a valid first name into the 'first name' field
    And I have entered a valid last name into the 'last name' field
    When I have a valid email into the 'email' field
    Then I should see the 'done' button is 'enabled'

  Scenario: Submit name and email - API Unavilable (TODO)

  @SubmitNameAndEmailScenario
  Scenario: Submit name and email
    Given I have entered correct identity details
    When I press the 'done' button
    Then I should be on the 'brain wallet' screen
    And I should see a message informing 'choose 5-10 word phrase'
    And I should see a 'generate phrase' button
    And I should see a 'enter phrase' field
    And I should see a 'store local copy' checkbox
    And I should see a 'learn more' link
    And I should see a 'done' button
    And I should see the 'done' button is 'disabled'

  @StorePassphraseLearnMoreScenario
  Scenario: Store pass phrase - learn more
    Given I have submitted name and email
    When I press the 'learn more' link
    Then I should see a modal appear
    And I should see a 'ok' button

  @StorePassphraseLearnMoreOkScenario
  Scenario: Store pass phrase - learn more - ok
    Given I have submitted name and email
    And I have pressed the 'learn more' link
    When I press the 'ok' button
    Then I should not see the 'learn more' modal

  @BrainWalletSuggestPhraseScenario
  Scenario: Brain wallet - suggest phrase
    Given I have submitted name and email
    When I press the 'generate phrase' button
    Then I should see a '5 word phrase' in the 'enter phrase' field
    And I should see the 'done' button is 'enabled'

  Scenario: Brain wallet - validations (TODO)

  @SubmitPhraseWithStorageScenario
  Scenario: Submit phrase - with storage
    Given I have submitted name and email
    And I have entered a valid phrase into the 'enter phrase' field
    When I press the 'done' button
    Then I should see a 'write it down' modal
    And I should see a message informing me 'write down phrase'
    And I should see a message informing me 'cannot be recovered'
    And I should see my brain wallet phrase
    And I should see a 'cancel' button
    And I should see a 'wrote it down' button

  @SubmitPhraseWithStorageCancelScenario
  Scenario: Submit phrase - with storage - cancel
    Given I have submitted phrase
    When I press the 'cancel' button
    Then I should not see the 'write it down' modal

  @SubmitPhraseWithStorageWroteItDownScenario
  Scenario: Submit phrase - with storage - wrote it down
    Given I have submitted phrase
    When I press the 'wrote it down' button
    Then I should see a 'please wait' modal
    And I should be on the 'home' screen
    And I should see a request for UR app to access my contacts
