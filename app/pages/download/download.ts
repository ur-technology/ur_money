import {Page, NavController, Platform} from 'ionic-angular';

@Page({
  templateUrl: 'build/pages/download/download.html',
})
export class DownloadPage {
  public currentUrl: string;
  public deviceType: string;

  constructor(public nav: NavController, private platform: Platform) {
    let portSuffix = window.location.port && window.location.port != "80" && window.location.port != "443" ? ":" + window.location.port : "";
    this.currentUrl = `${window.location.protocol}//${window.location.hostname}${portSuffix}/app`;
    this.deviceType = this.getDeviceType();
  }

  private getDeviceType() {
    var userAgent = navigator.userAgent || navigator.vendor;
    if (/android/i.test(userAgent)) {
      return "android";
    }
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return "ios";
    }
    return "other";
  }
}
