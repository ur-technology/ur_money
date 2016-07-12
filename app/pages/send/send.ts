import {Page, Alert, NavController} from 'ionic-angular';
import {HomePage} from '../home/home';
import {Wallet} from '../../components/wallet/wallet2';

@Page({
  templateUrl: 'build/pages/send/send.html',
})
export class SendPage {
  showContactInput: boolean;
  contactItem: any;
  showContacts: boolean;
  
  amount: number;
  phrase: string;
  password: string;
  publicKey: string;

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

  validateForm() {
    let ethUtil = require('ethereumjs-util');

    return (
      this.amount > 0 &&
      this.phrase != '' &&
      this.password != '' &&
      (this.publicKey != '' && (ethUtil.isValidAddress(this.publicKey) || ethUtil.isValidPublic(this.publicKey)))
    )
  }

  sendUR() {
    let self = this;
    
    let wallet: Wallet = new Wallet();

    if(!this.validateForm()) {
      return;
    }

    let confirmation = Alert.create({
      title: 'Confirmation',
      message: "<p>Sending " + this.amount.toFixed(4) + " ETH</p>",
      buttons: [

        {
          text: 'OK',
          handler: () => {
            self.error();

            wallet.create(self.phrase, self.password).then(() => {
              wallet.sendTransaction(self.publicKey, self.amount).then((err) => {
                if (!err)
                  self.success();
                else
                  self.error();
              });
            });
          }
        },
        {
          text: 'CANCEL',
          role: 'cancel',
          handler: () => {
            // do nothing
          }
        }
      ]
    });
    this.nav.present(confirmation);
  }

  success(){
    let successAlert = Alert.create({
      title: 'Success',
      message: "<p>Transaction successfully created</p>",
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.nav.setRoot(HomePage);
          }
        }
      ]
    });
    this.nav.present(successAlert);
  }

  error(){
    let errorAlert = Alert.create({
      title: 'Error',
      message: "<p>An error occurred</p>",
      buttons: ['OK']
    });
    this.nav.present(errorAlert);
  }
}
