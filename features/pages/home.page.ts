import { $ } from 'protractor';

export class HomePageObject {
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
};
