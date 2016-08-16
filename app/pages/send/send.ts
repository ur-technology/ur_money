import {Page, AlertController, NavController, NavParams} from 'ionic-angular';
import {HomePage} from '../home/home';
import {WalletModel} from '../../models/wallet';

@Page({
  templateUrl: 'build/pages/send/send.html',
})
export class SendPage {
  amount: number;
  phrase: string;
  contact: any;

  constructor(public nav: NavController, public navParams: NavParams,  private alertCtrl: AlertController) {
    this.contact = this.navParams.get('contact');
  }

  sendUR() {
    let self = this;
    self.confirmation().then(() => {
      if (WalletModel.validateCredentials(self.phrase, self.contact.userId)) {
        WalletModel.generate(self.phrase, self.contact.userId).then((data) => {
          let wallet: WalletModel = new WalletModel(data);

          if (!wallet.validateAddress(self.contact.wallet.address)) {
            self.error("Recipient address is not valid");
            return;
          }

          if (!wallet.validateAmount(self.amount)) {
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
      let prompt = this.alertCtrl.create({
        title: 'Secret phrase',
        message: "Please enter your account's secret phrase",
        inputs: [{ name: 'secretPhrase', placeholder: 'Secret Phrase' }],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              reject();
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Continue',
            handler: data => {
              this.confirmationStep2(resolve, reject);
              console.log('Saved clicked');
            }
          }
        ]
      });
      prompt.present();
    });
  }

  confirmationStep2(resolve: any, reject: any) {
    let prompt = this.alertCtrl.create({
      title: 'Confirmation',
      message: "<p>Sending " + this.amount.toFixed(4) + " UR</p>",
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
            reject();
          }
        }
      ]
    });
    prompt.present();
  }

  success() {
    let successAlert = this.alertCtrl.create({
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
    successAlert.present();
  }

  error(text) {
    let errorAlert = this.alertCtrl.create({
      title: 'Error',
      message: "<p>" + text + "</p>",
      buttons: ['OK']
    });
    errorAlert.present();
  }
}
