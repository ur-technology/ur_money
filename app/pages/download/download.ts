import {Page, NavController, Platform} from 'ionic-angular';
import {Config} from '../../config/config';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {AngularFire} from 'angularfire2';
import * as firebase from 'firebase';

@Page({
  templateUrl: 'build/pages/download/download.html',
  pipes: [TranslatePipe]
})
export class DownloadPage {
  public currentUrl: string;
  public deviceType: string;
  public config: any;
  version: any = '';

  constructor(public nav: NavController, private platform: Platform, public angularFire: AngularFire) {
    let portSuffix = window.location.port && window.location.port !== '80' && window.location.port !== '443' ? ':' + window.location.port : '';
    this.currentUrl = `${window.location.protocol}//${window.location.hostname}${portSuffix}/app`;
    this.deviceType = this.getDeviceType();
    this.config = Config;
    this.readVersion();
  }

  private readVersion() {
    firebase.database().ref(`/version`).once('value', (data) => {
      this.version = data.val();
    });
  }

  private getDeviceType() {
    var userAgent = navigator.userAgent || navigator.vendor;
    if (/android/i.test(userAgent)) {
      return 'android';
    }
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return 'ios';
    }
    return 'other';
  }
}
