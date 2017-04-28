import { $, browser, ExpectedConditions } from 'protractor';

export class SignInPage {
  public form: any;
  public countrySelect: any;
  public countrySelectAlert: any;
  public unitedStatesSelect: any;
  public countrySelectOkBtn: any;
  public countrySelectCancelBtn: any;
  public phoneNumberInput: any;
  public continueBtn: any;

  constructor() {
    this.form = $('form');
    this.countrySelect = this.form.$('ion-item.item-select');
    this.countrySelectAlert = $('ion-alert');
    this.unitedStatesSelect = this.countrySelectAlert.$('button#alert-input-0-211');
    this.countrySelectOkBtn = this.countrySelectAlert.$('.alert-button-group').$$('button.alert-button').get(1);
    this.countrySelectCancelBtn = this.countrySelectAlert.$('.alert-button-group').$$('button.alert-button').get(0);
    this.phoneNumberInput = this.form.$('.phone-content').$('input.text-input');
    this.continueBtn = this.form.$('button.button-default');
  }

  openCountrySelect() {
    return browser
      .wait(ExpectedConditions.elementToBeClickable(this.countrySelect), 3000)
      .then(() => this.countrySelect.click())
      .then(() => browser.sleep(3000));
  }

  selectUnitedStates() {
    return browser
      .wait(ExpectedConditions.elementToBeClickable(this.unitedStatesSelect), 3000)
      .then(() => this.unitedStatesSelect.click())
      .then(() => browser.sleep(3000));
  }

  enterPhoneNumber(mobileNo: string) {
    return this.phoneNumberInput.sendKeys(mobileNo);
  }
}
