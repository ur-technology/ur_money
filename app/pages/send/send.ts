import {Page, Alert, NavController} from 'ionic-angular';
import {HomePage} from '../home/home';
// import Web3 = require('web3');

@Page({
  templateUrl: 'build/pages/send/send.html',
})
export class SendPage {
  showContactInput: boolean;
  contactItem: any;
  showContacts: boolean;

  Web3: any;
  amount: any;
  phrase: any;
  publicKey: any;


  constructor(public nav: NavController) {
    this.showContactInput = true;
    this.showContacts = false;
    this.contactItem = {};

    let web3 = require('web3');
    this.Web3 = new web3(new web3.providers.HttpProvider("http://localhost:12345"));
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

  validateFrom() {
    let ethUtil = require('ethereumjs-util');

    return (
      (this.amount && parseFloat(this.amount) > 0) &&
      this.phrase != '' &&
      (this.publicKey && (ethUtil.isValidAddress(this.publicKey) || ethUtil.isValidPublic(this.publicKey)))
    )
  }

  sendUR() {
    let self = this;

    if(!this.validateFrom()) {
      return;
    }

    let confirmation = Alert.create({
      title: 'Confirmation',
      message: "<p>Sending " + parseFloat(this.amount).toFixed(4) + " ETH</p>",
      buttons: [

        {
          text: 'OK',
          handler: () => {
            self.error();

            let ethWallet = require('ethereumjs-wallet/thirdparty');

            let brainWallet = ethWallet.fromEtherCamp('asd');

            this.Web3.eth.sendTransaction({
              from  : brainWallet.getPrivateKeyString(),
              to    : this.publicKey.toString(),
              value : this.Web3.toWei(parseFloat(this.amount))
            }, function(err, address) {
              if (!err)
                self.success();
              else
                self.error();
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
