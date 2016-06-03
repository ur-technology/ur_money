import {Page, NavController, NavParams} from 'ionic-angular';

/*
  Generated class for the ErrorPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/prelaunch_pages/error/error.html',
})
export class ErrorPage {
  message: string;

  constructor(public nav: NavController, public navParams: NavParams) {
    this.message = navParams.get("message");
  }
}
