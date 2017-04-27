import { $, browser, ExpectedConditions } from 'protractor';

export class HomePage {
  public logoDiv: any;
  public welcomeDiv: any;
  public welcomeMsg: any;
  public signUpBtn: any;
  public signInBtn: any;

  constructor() {
    this.logoDiv = $('div.ur-logo');
    this.welcomeDiv = $('div.welcome-ur');
    this.welcomeMsg = this.welcomeDiv.$('h3');
    this.signUpBtn = this.welcomeDiv.$$('button').get(0);
    this.signInBtn = this.welcomeDiv.$$('button').get(1);
  }

  signIn() {
    return browser
      .wait(ExpectedConditions.elementToBeClickable(this.signInBtn), 3000)
      .then(() => this.signInBtn.click())
      .then(() => browser.sleep(3000));
  }
};
