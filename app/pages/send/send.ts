import {Page, Alert, NavController} from 'ionic-angular';
import {HomePage} from '../home/home';
import {Wallet} from '../../components/wallet/wallet';

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

  sendUR() {

    let self = this;

    self.confirmation().then(() => {
      if(Wallet.validateCredentials(self.phrase, self.password)){
        Wallet.generate(self.phrase, self.password).then((data) => {
          let wallet: Wallet = new Wallet(data);

          if(!wallet.validateAddress(self.publicKey)){
            self.error("Recipient address is not valid");
            return;
          }

          if(!wallet.validateAmount(self.amount)){
            self.error("Not enough coins or amount is not correct");
            return;
          }

          wallet.sendRawTransaction(self.publicKey, self.amount).then((err) => {
            if (!err)
              self.success();
            else
              self.error("An error occured during transaction");
          });
        })
      } else {
        self.error("Enter secret phrase and password");
      }
    });

  }

  confirmation() {
    return new Promise((resolve, reject) => {
      let confirmation = Alert.create({
        title: 'Confirmation',
        message: "<p>Sending " + this.amount.toFixed(4) + " ETH</p>",
        buttons: [

          {
            text: 'OK',
            handler: () => {
              resolve();
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
    });
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

  error(text){
    let errorAlert = Alert.create({
      title: 'Error',
      message: "<p>" + text + "</p>",
      buttons: ['OK']
    });
    this.nav.present(errorAlert);
  }
}
