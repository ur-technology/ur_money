import { browser, ExpectedConditions } from 'protractor';
import { binding, given } from 'cucumber-tsflow';

import { HomePage } from '../pages/home.page';

@binding()
class BackgroundSteps {

  homePage: HomePage;

  constructor() {
    this.homePage = new HomePage();
  }

  @given(/^I have opened the UR app$/)
  public GivenIHaveOpenedTheURApp (callback): void {
    browser
      .get('')
      .then(() => browser.wait(ExpectedConditions.presenceOf(this.homePage.logoDiv), 15 * 1000)) // Wait until page is fully loaded
      .then(() => callback());
  }

  @given(/^I have clicked Sign In button$/)
  public GivenIHaveClickedSignInButton (callback): void {
    this.homePage
      .signIn()
      .then(() => callback());
  }

}

export default BackgroundSteps;