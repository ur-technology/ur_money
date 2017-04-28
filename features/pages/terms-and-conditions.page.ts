import { $, browser, ExpectedConditions } from 'protractor';

export class TermsAndConditionsPage {
  public termsMessage: any;
  public termsLink: any;
  public modal: any;
  public modalHeader: any;
  public modalTitle: any;
  public modalDoneButton: any;
  public modalContent: any;

  constructor() {
    this.termsMessage = $('p.terms');
    this.termsLink = this.termsMessage.$('a.terms-btn');
    this.modal = $('ion-modal');
    this.modalHeader = this.modal.$('ion-header');
    this.modalTitle = this.modalHeader.$('ion-title');
    this.modalDoneButton = this.modalHeader.$('ion-navbar').$('ion-buttons').$('button.bar-button');
    this.modalContent = this.modal.$('ion-content');
  }

  openTermsAndConditions() {
    return browser.wait(ExpectedConditions.elementToBeClickable(this.termsLink), 3000)
    .then(() => this.termsLink.click())
    .then(() => browser.sleep(3000));
  }

  exitTermsAndConditions() {
    return browser.wait(ExpectedConditions.elementToBeClickable(this.modalDoneButton), 3000)
    .then(() => this.modalDoneButton.click())
    .then(() => browser.sleep(3000));
  }
}
