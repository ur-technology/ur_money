import { browser } from 'protractor';
import * as fs from 'fs';

export default function () {
  this.After((scenario, done) => {
    if (scenario.isFailed()) {
      return browser.takeScreenshot().then(function (base64png) {
        let decodedImage = new Buffer(base64png, 'base64').toString('binary');
        scenario.attach(decodedImage, 'image/png');
      }, (err) => {
        done(err);
      });
    } else {
      done();
    }
  });
};
