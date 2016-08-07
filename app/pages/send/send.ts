import {Page, Alert, NavController, NavParams} from 'ionic-angular';
import {HomePage} from '../home/home';
import {WalletModel} from '../../models/wallet';

@Page({
  templateUrl: 'build/pages/send/send.html',
})
export class SendPage {
  amount: number;
  phrase: string;
  contact: any;

  constructor(public nav: NavController, public navParams: NavParams) {
    this.contact = this.navParams.get('contact');
  }

  sendUR() {
    let self = this;
    self.confirmation().then(() => {
      if (WalletModel.validateCredentials(self.phrase, self.contact.userId)){
        WalletModel.generate(self.phrase, self.contact.userId).then((data) => {
          let wallet: WalletModel = new WalletModel(data);

          if (!wallet.validateAddress(self.contact.wallet.address)) {
            self.error("Recipient address is not valid");
            return;
          }

          if (!wallet.validateAmount(self.amount)){
            self.error("Not enough coins or amount is not correct");
            return;
          }

          wallet.sendRawTransaction(self.contact.wallet.address, self.amount).then((err) => {
            if (!err)
              self.success();
            else
              self.error("An error occured during transaction");
          });
        })
      } else {
        self.error("The secret phrase you entered was not correct.");
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

  success() {
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

  error(text) {
    let errorAlert = Alert.create({
      title: 'Error',
      message: "<p>" + text + "</p>",
      buttons: ['OK']
    });
    this.nav.present(errorAlert);
  }
}
