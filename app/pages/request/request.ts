import {Page, NavController} from 'ionic-angular';
import {HomePage} from '../home/home';
/*
  Generated class for the RequestPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/request/request.html',
})
export class RequestPage {
  showContactInput: boolean = true;
  showContactsPopup: boolean = false;
  constructor(public nav: NavController) { }

  toHomePage() {
    this.nav.setRoot(HomePage, {}, { animate: true, direction: 'forward' });
  }

  inputBlur() {
    setTimeout(() => {
      this.showContactsPopup = false;
    }, 300);
  }


  addContact(contact) {
    this.showContactInput = false;
    this.showContactsPopup = false;
  }

  removeContact() {
    this.showContactInput = true;
  }
}
