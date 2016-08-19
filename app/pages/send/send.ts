import {OnInit, OnChanges} from '@angular/core';
import {Page, AlertController, NavController, NavParams} from 'ionic-angular';
import {HomePage} from '../home/home';
import {WalletModel} from '../../models/wallet';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {CustomValidator} from '../../validators/custom';

@Page({
  templateUrl: 'build/pages/send/send.html',
})
export class SendPage {
  phrase: string;
  contact: any;
  mainForm: FormGroup;
  balance: number;

  constructor(public nav: NavController, public navParams: NavParams, private alertCtrl: AlertController) {
    this.contact = this.navParams.get('contact');
    this.mainForm = new FormGroup({
      amount: new FormControl("", [CustomValidator.positiveNumberValidator, Validators.required]),
      message: new FormControl(""),
      balance: new FormControl("")
    });
  }

  ngOnInit() {
    this.mainForm.find("amount").valueChanges.subscribe((data) => {
      this.calculateBalance();
    });

    this.balance = 1000;
    (this.mainForm.find("balance") as FormControl).updateValue(this.balance);
  }

  calculateBalance() {
    let amount = this.mainForm.find("amount").valid ? Number(this.mainForm.find("amount").value) : 0;
    let balance: number = this.balance - amount;
    if (balance < 0) {
      (this.mainForm.find("amount") as FormControl).setErrors({ invalidBalance: true });
    }
  }

  sendUR() {
    let amount: number = Number(this.mainForm.value.amount);
    let self = this;
    self.confirmation().then(() => {
      if (WalletModel.validateCredentials(self.phrase, self.contact.userId)) {
        WalletModel.generate(self.phrase, self.contact.userId).then((data) => {
          let wallet: WalletModel = new WalletModel(data);
          if (!wallet.validateAddress(self.contact.wallet.address)) {
            self.error("Recipient address is not valid");
            return;
          }

          if (!wallet.validateAmount(amount)) {
            self.error("Not enough coins or amount is not correct");
            return;
          }

          wallet.sendRawTransaction(self.contact.wallet.address, amount).then((err) => {
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
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked', data);
            }
          },
          {
            text: 'Continue',
            handler: data => {
              prompt.dismiss().then(() => {
                this.confirmationStep2(resolve, reject);
              });
            }
          }
        ]
      });
      prompt.present();
    });
  }

  confirmationStep2(resolve: any, reject: any) {
    let amount: number = Number(this.mainForm.value.amount);
    let prompt = this.alertCtrl.create({
      title: 'Confirmation',
      message: "<p>Send " + amount.toFixed(4) + " UR?</p>",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked', data);
          }
        },
        {
          text: 'Ok',
          handler: data => {
            prompt.dismiss().then(() => {
              resolve();
            });
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
