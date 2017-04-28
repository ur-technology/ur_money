import { browser } from 'protractor';
import { binding, when, then } from 'cucumber-tsflow';

import { TermsAndConditionsPage } from '../pages/terms-and-conditions.page';
import { SignInPage } from '../pages/sign-in.page';

let chai = require('chai').use(require('chai-as-promised'));
let expect = chai.expect;

@binding()
class SignInSteps {

  termsAndConditionsPage: TermsAndConditionsPage;
  signInPage: SignInPage;

  constructor() {
    this.termsAndConditionsPage = new TermsAndConditionsPage();
    this.signInPage = new SignInPage();
  }

  /**
   * @FirstTimeSignInScreenScenario steps
   */

  @then(/^I should be on the first time sign in screen$/)
  public ThenIShouldBeOnTheFirstTimeSignInScreen(callback): void {
    expect(browser.getTitle()).to.eventually.equal('UR Money');
    expect(this.termsAndConditionsPage.termsMessage.isPresent()).to.eventually.be.true;
    expect(this.termsAndConditionsPage.modal.isPresent()).to.eventually.be.false;
    callback();
  }

  @then(/^I should see a message informing me 'click agree & continue to accept the UR Technology'$/)
  public ThenIShouldSeeMessageInformingMeClickAgreeAndContinue (callback): void {
    expect(this.termsAndConditionsPage.termsMessage.isPresent()).to.eventually.be.true;
    expect(this.termsAndConditionsPage.termsMessage.getText()).to.eventually.have
      .string('Click "Agree & Continue" to accept the UR Technology Terms and Service Agreement');

    callback();
  }

  @then(/^I should see a 'terms and conditions' link$/)
  public ThenIShouldSeeTermsAndConditionsLink (callback): void {
    expect(this.termsAndConditionsPage.termsLink.isPresent()).to.eventually.be.true;
    callback();
  }

  @then(/^I should see a 'country select' field$/)
  public ThenIShouldSeeCountrySelectField (callback): void {
    expect(this.signInPage.countrySelect.isPresent()).to.eventually.be.true;
    callback();
  }

  @then(/^I should see a 'phone number' field$/)
  public ThenIShouldSeePhoneNumberField (callback): void {
    expect(this.signInPage.phoneNumberInput.isPresent()).to.eventually.be.true;
    callback();
  }

  @then(/^I should see a 'agree & continue' button$/)
  public ThenIShouldSeeAgreeAndContinueButton (callback): void {
    expect(this.signInPage.continueBtn.isPresent()).to.eventually.be.true;
    callback();
  }

  @then(/^I should see the 'agree & continue' button is 'disabled'$/)
  public ThenIShouldSeeAgreeAndContinueButtonIsDisabled (callback): void {
    expect(this.signInPage.continueBtn.isEnabled()).to.eventually.be.false;
    callback();
  }

  /**
   * @SignInScreenOpenTermsAndConditionsScenario steps
   */

  @when(/^I press the 'terms and conditions' link$/)
  public WhenIPressTheTermsAndConditionsLink (callback): void {
    this.termsAndConditionsPage.openTermsAndConditions().then(callback);
  }

  @then(/^I should be on the 'terms and conditions' modal$/)
  public ThenIShouldBeOnTheTermsAndConditionsModal (callback): void {
    expect(this.termsAndConditionsPage.modal.isPresent()).to.eventually.be.true;
    expect(this.termsAndConditionsPage.modalTitle.getText()).to.eventually.equal('Terms and Conditions');
    callback();
  }

  @then(/^I should see the terms and conditions$/)
  public ThenIShouldSeeTheTermsAndConditions (callback): void {
    expect(this.termsAndConditionsPage.modalContent.getText()).to.eventually.have
      .string('This is a contract between you and UR Technology Inc. ("UR Technology")');
    callback();
  }

  @then(/^I should see a modal 'done' button$/)
  public ThenIShouldSeeModalDoneButton (callback): void {
    expect(this.termsAndConditionsPage.modalDoneButton.isPresent()).to.eventually.be.true;
    expect(this.termsAndConditionsPage.modalDoneButton.getText()).to.eventually.equal('DONE');
    callback();
  }

}

export default SignInSteps;
