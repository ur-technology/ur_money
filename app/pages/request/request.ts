import {Page, NavController} from 'ionic-angular';
import {HomePage} from '../home/home';
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";

@Page({
  templateUrl: 'build/pages/request/request.html',
  pipes: [TranslatePipe]
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
