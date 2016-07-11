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
    let wallet: Wallet = new Wallet();

    // this.phrase = 'asd';
    // this.password = 'qwe';
    // this.publicKey = '0x350ee71aa87a5d89ceccda8ff8ad4cbe588571d5';
    // this.amount = 3.2;
    //
    // wallet.create(this.phrase, this.password).then(() => {
    //   wallet.sendTransaction(this.publicKey, this.amount).then((err) => {
    //     console.log(err);
    //   });
    // });

    let self = this;

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
            
            wallet.create(this.phrase, this.password).then(() => {
              wallet.sendTransaction(this.publicKey, this.amount).then((err) => {
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



    // console.log(brainWallet.getPrivateKeyString());
    // console.log(brainWallet.getPublicKeyString());
    // console.log(brainWallet.getAddressString());

    //if phrase = 'asd'

    // 0x87c2d362de99f75a4f2755cdaaad2d11bf6cc65dc71356593c445535ff28f43d
    // 0x3efb6d6c3c90d2c515e6f027d92aed3f79f857dc534f0c7b79951fb8c54d6dd6fe81d65bb8222281d8c34c23b630ae2c2ccd470684280a71800ca349077aa9c5
    // 0x46617244c5017915000077c93d6f5ca72effed47
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
