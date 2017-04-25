import { browser, ExpectedConditions } from 'protractor';
import { binding, given } from 'cucumber-tsflow';

import { HomePageObject } from '../pages/home.page';

@binding()
class BackgroundSteps {

  homePage: HomePageObject;

  constructor() {
    this.homePage = new HomePageObject();
  }

  @given(/^I have opened the UR app$/)
  public GivenIHaveOpenedTheURApp (callback): void {
    browser.get('')
    .then(() => browser.wait(ExpectedConditions.presenceOf(this.homePage.logoDiv), 15 * 1000)) // Wait until page is fully loaded
    .then(() => callback());
  }

}

export default BackgroundSteps;
