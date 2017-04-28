import { browser } from 'protractor';
import { binding, given, when, then } from 'cucumber-tsflow';

import { TermsAndConditionsPage } from '../pages/terms-and-conditions.page';
import { SignInPage } from '../pages/sign-in.page';

let chai = require('chai').use(require('chai-as-promised'));
let expect = chai.expect;

const INVALID_MOBILE: string = '.323+234';
const VALID_MOBILE: string = '6199344518';

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
    // expect(browser.getTitle()).to.eventually.equal('UR Money');
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
    this.termsAndConditionsPage
      .openTermsAndConditions()
      .then(callback);
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

  /**
   * @SignInScreenExitTermsAndConditionsScenario steps
   */

  @given(/^I have opened the terms and conditions$/)
  public GivenIHaveOpenedTheTermsAndConditions (callback): void {
    this.termsAndConditionsPage
      .openTermsAndConditions()
      .then(callback);
  }

  @when(/^I click the 'done' button$/)
  public WhenIClickTheDoneButton (callback): void {
    this.termsAndConditionsPage
      .exitTermsAndConditions()
      .then(callback);
  }

  /**
   * @CountrySelectScenario steps
   */

  @when(/^I press the 'country select' field$/)
  public WhenIPressTheCountrySelectField (callback): void {
    this.signInPage
      .openCountrySelect()
      .then(callback);
  }

  @then(/^I should see a list of countries with area codes$/)
  public ThenIShouldSeeListOfCountriesWithAreaCode (callback): void {
    expect(this.signInPage.countrySelectAlert.isPresent()).to.eventually.be.true;
    callback();
  }

  @then(/^I should see 'United States' in the 'country select' field$/)
  public ThenIShouldSeeUnitedStatesInTheCountrySelectField (callback): void {
    expect(this.signInPage.unitedStatesSelect.isPresent()).to.eventually.be.true;
    expect(this.signInPage.unitedStatesSelect.getText()).to.eventually.equal('United States');
    callback();
  }

  @then(/^I should see 'country select Ok' button$/)
  public ThenIShouldSeeCountrySelectOkButton (callback): void {
    expect(this.signInPage.countrySelectOkBtn.isPresent()).to.eventually.be.true;
    expect(this.signInPage.countrySelectOkBtn.getText()).to.eventually.equal('OK');
    callback();
  }

  @then(/^I should see 'country select Cancel' button$/)
  public ThenIShouldSeeCountrySelectCancelButton (callback): void {
    expect(this.signInPage.countrySelectCancelBtn.isPresent()).to.eventually.be.true;
    expect(this.signInPage.countrySelectCancelBtn.getText()).to.eventually.equal('CANCEL');
    callback();
  }

  /**
   * @EnterInvalidPhoneNumberScenario steps
   */

  @given(/^I have selected 'United States' from the 'country' select$/)
  public GivenIHaveSelectedUnitedStatesFromCountrySelect(callback): void {
    this.signInPage
      .openCountrySelect()
      .then(() => this.signInPage.selectUnitedStates())
      .then(() => this.signInPage.closeCountrySelectAlert())
      .then(callback);
  }

  @when(/^I enter an invalid mobile number$/)
  public WhenIEnterInvalidPhoneNumber(callback): void {
    this.signInPage
      .enterPhoneNumber(INVALID_MOBILE)
      .then(callback);
  }

  @then(/^I should see the 'phone number' field is 'invalid'$/)
  public ThenIShouldSeeThePhoneNumberFieldIsInvalid(callback): void {
    expect(this.signInPage.phoneNumberInput.getAttribute('class')).to.eventually.have.string('ng-invalid');
    callback();
  }

  /**
   * @EnterValidPhoneNumberScenario steps
   */

  @when(/^I enter a valid mobile number$/)
  public WhenIEnterValidMobileNumber (callback): void {
    this.signInPage
      .enterPhoneNumber(VALID_MOBILE)
      .then(callback);
  }

  @then(/^I should see the 'phone number' field is 'valid'$/)
  public ThenIShouldSeePhoneNumberFieldIsValid (callback): void {
    expect(this.signInPage.phoneNumberInput.getAttribute('class')).to.eventually.have.string('ng-valid');
    callback();
  }

  @then(/^I should see the 'agree & continue' button is 'enabled'$/)
  public ThenIShouldSeeAgreeAndContinueButtonIsEnabled (callback): void {
    expect(this.signInPage.continueBtn.isEnabled()).to.eventually.be.true;
    callback();
  }

}

export default SignInSteps;
