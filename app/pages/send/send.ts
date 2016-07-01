import {Page, NavController} from 'ionic-angular';
import {HomePage} from '../home/home';

@Page({
  templateUrl: 'build/pages/send/send.html',
})
export class SendPage {
  showContactInput: boolean;
  contactItem: any;
  showContacts: boolean;
  constructor(public nav: NavController) {
    this.showContactInput = true;
    this.showContacts = false;
    this.contactItem = {};
  }

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
    this.contactItem = {};
  }

  sendUR() {
    // TODO: Alex: Insert code to again generate public and private keys based on this.secretPhrase

    // TODO: Alex: Next send the specified amount to the specified recipient

    let myPublicKey = "0x8805317929d0a8cd1e7a19a4a2523b821ed05e42"; // using this dummy address for now
    let recipientPublicKey = "0x8805317929d0a8cd1e7a19a4a2523b821ed05e43"; // using this dummy address for now
    let urAmount = 1.5 // using this dummy amount for now
    let weiAmount = 1000000000000000000 * 1.5; // need to use something like bigdecimal here

    // TODO: send weiAmount to recipientPublicKey...

    // TODO: display message to user...

    // all done
    this.nav.setRoot(HomePage);
  }
}
