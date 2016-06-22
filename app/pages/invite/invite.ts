import {Page, NavController} from 'ionic-angular';
import {HomePage} from '../home/home';

/*
  Generated class for the InvitePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/invite/invite.html',
})
export class InvitePage {
  constructor(public nav: NavController) {}

  goBack(){
    this.nav.setRoot(HomePage, {}, { animate: true, direction: 'forward' });
  }
}
