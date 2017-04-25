import { binding, then } from 'cucumber-tsflow';

import { HomePageObject } from '../pages/home.page';

let chai = require('chai').use(require('chai-as-promised'));
let expect = chai.expect;

@binding()
class HomePageSteps {

  homePage: HomePageObject;

  constructor() {
    this.homePage = new HomePageObject();
  }

  @then(/^I should be on the 'home' screen$/)
  public ThenIShouldBeOnTheHomeScreen(callback): void {
    expect(this.homePage.logoDiv.isPresent()).to.eventually.be.true;
    callback();
  }

  @then(/^I should see a message informing me 'Welcome to UR'$/)
  public ThenIShouldSeeMessageInformingMeWelcomeToUR (callback): void {
    expect(this.homePage.welcomeMsg.getText()).to.eventually.contain('Welcome to UR');
    callback();
  }

  @then(/^I should see a 'sign up' button$/)
  public ThenIShouldSeeSignUpButton (callback): void {
    expect(this.homePage.signUpBtn.getText()).to.eventually.equal('SIGN UP');
    expect(this.homePage.signUpBtn.isPresent()).to.eventually.be.true;
    callback();
  }

  @then(/^I should see a 'sign in' button$/)
  public ThenIShouldSeeSignInButton (callback): void {
    expect(this.homePage.signInBtn.getText()).to.eventually.equal('SIGN IN');
    expect(this.homePage.signInBtn.isPresent()).to.eventually.be.true;
    callback();
  }

}

export default HomePageSteps;
