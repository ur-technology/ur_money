import { binding, then } from 'cucumber-tsflow';

let chai = require('chai').use(require('chai-as-promised'));
let expect = chai.expect;

@binding()
class SignInSteps {

  constructor() {
  }

  @then(/^I should be on the first time sign in screen$/)
  public ThenIShouldBeOnTheFirstTimeSignInScreen(callback): void {
    // Write code here that turns the phrase above into concrete actions
    callback();
  }

  @then(/^I should see a 'terms and conditions' link$/)
  public ThenIShouldSeeTermsAndConditionsLink (callback): void {
    // Write code here that turns the phrase above into concrete actions
    callback();
  }

  @then(/^I should see a 'country select' field$/)
  public ThenIShouldSeeCountrySelectField (callback): void {
    // Write code here that turns the phrase above into concrete actions
    callback();
  }

  @then(/^I should see 'United States' in the 'country select' field$/)
  public ThenIShouldSeeUnitedStatesInCountrySelectField (callback): void {
    // Write code here that turns the phrase above into concrete actions
    callback();
  }

  @then(/^I should see a 'phone number' field$/)
  public ThenIShouldSeePhoneNumberField (callback): void {
    // Write code here that turns the phrase above into concrete actions
    callback();
  }

  @then(/^I should see a message informing me 'click agree & continue to accept the UR Technology'$/)
  public ThenIShouldSeeMessageInformingMeClickAgreeAndContinue (callback): void {
    // Write code here that turns the phrase above into concrete actions
    callback();
  }

  @then(/^I should see a 'agree & continue' button$/)
  public ThenIShouldSeeAgreeAndContinueButton (callback): void {
    // Write code here that turns the phrase above into concrete actions
    callback();
  }

  @then(/^I should see the 'agree & continue' button is 'disabled'$/)
  public ThenIShouldSeeAgreeAndContinueButtonIsDisabled (callback): void {
    // Write code here that turns the phrase above into concrete actions
    callback();
  }

}

export default SignInSteps;
