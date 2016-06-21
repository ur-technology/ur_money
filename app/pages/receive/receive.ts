import {Page, NavController} from 'ionic-angular';
import {HomePage} from '../home/home';
/*
  Generated class for the ReceivePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/receive/receive.html',
})
export class ReceivePage {
  showContactInput: boolean = true;
  contactItem: any;
  showContacts: boolean = false;
  constructor(public nav: NavController) { }

  toHomePage() {
    this.nav.setRoot(HomePage, {}, { animate: true, direction: 'forward' });
  }

  inputBlur() {
    setTimeout(() => {
      this.showContacts = false;
    }, 300);
  }

  
  addContact(contact) {
    this.showContactInput = false;
    this.showContacts = false;
    this.contactItem = { email: contact };
  }

  removeContact() {
    this.showContactInput = true;
    this.contactItem = null;
  }
}