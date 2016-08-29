import {OnInit, OnChanges} from '@angular/core';
import {Page, AlertController, NavController, NavParams, ToastController} from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import * as log from 'loglevel';

import {HomePage} from '../home/home';
import {WalletModel} from '../../models/wallet';
import {CustomValidator} from '../../validators/custom';
import {AuthService} from '../../services/auth';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/send/send.html',
})
export class SendPage {
  contact: any;
  mainForm: FormGroup;
  balance: number;
  private wallet: WalletModel;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {
    this.contact = this.navParams.get('contact');
    this.mainForm = new FormGroup({
      amount: new FormControl("", [CustomValidator.positiveNumberValidator, Validators.required]),
      message: new FormControl(""),
      balance: new FormControl("")
    });
  }

  ngOnInit() {
    WalletModel.availableBalanceAsync(this.authService.currentUser.wallet.address)
      .then(availableBalance => {
        this.balance = availableBalance;
      });
  }

  sendUR() {
    let self = this;
    self.obtainAndValidateSecretPhrase().then(() => {
      return self.confirm();
    }).then(() => {
      return self.wallet.sendRawTransaction(self.contact.wallet.address, Number(self.mainForm.value.amount));
    }).then((urTransaction) => {
      let transactionRef = firebase.database().ref(`/users/${self.authService.currentUserId}/transactions/${urTransaction.hash}`);
      return transactionRef.set({
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
        urTransaction: urTransaction
      });
    }).then(() => {
      let toast = self.toastCtrl.create({ message: 'Your UR has been sent!', duration: 3000, position: 'bottom' });
      toast.present();
      this.nav.setRoot(HomePage);
    }, (error: any) => {
      self.toastCtrl.create({
        message: error.displayMessage ? error.displayMessage : "An unexpected error has occurred. Please try again later.",
        duration: 3000,
        position: 'bottom'
      }).present();
      log.debug(error.logMessage || error);
      // give up trying to send
    });
  }

  obtainAndValidateSecretPhrase() {
    let self = this;
    return new Promise((resolve, reject) => {
      let prompt = self.alertCtrl.create({
        title: 'Secret phrase',
        message: "Please enter your account's secret phrase",
        inputs: [{ name: 'secretPhrase', placeholder: 'Secret Phrase' }],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              reject({ logMessage: "cancel clicked" });
            }
          },
          {
            text: 'Continue',
            handler: data => {
              let secretPhrase = data.secretPhrase;
              prompt.dismiss().then(() => {
                WalletModel.generate(secretPhrase, self.authService.currentUserId).then((data) => {
                  self.wallet = new WalletModel(data);
                  if (self.wallet.getAddress() == self.authService.currentUser.wallet.address) {
                    resolve();
                  } else {
                    reject({ displayMessage: "The secret phrase you entered was not correct." });
                  }
                }, (error) => {
                  reject({
                    displayMessage: "An unexpected error occurred. Please try again later.",
                    logMessage: `cannot send UR: ${error}`
                  });
                });
              });
            }
          }
        ]
      });
      prompt.present().then(() => {
        let alertInput = jQuery("input.alert-input");
        alertInput.attr("autocapitalize", "off");
        alertInput.attr("autocorrect", "off");
      });
    });
  }

  confirm() {
    return new Promise((resolve, reject) => {
      let amount: number = Number(this.mainForm.value.amount); // add number:'1.2-2'
      let prompt = this.alertCtrl.create({
        title: 'Confirmation',
        message: `<p>Send ${amount} UR?</p>`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              reject({ logMessage: "cancel clicked" });
            }
          },
          {
            text: 'Ok',
            handler: data => {
              prompt.dismiss().then(() => { resolve(); });
            }
          }
        ]
      });
      prompt.present();
    });
  }
}
