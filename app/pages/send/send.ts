import {Page, AlertController, NavController, NavParams, ToastController} from 'ionic-angular';
import {NgZone} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {BigNumber} from 'bignumber.js';

import {HomePage} from '../home/home';
import {WalletModel} from '../../models/wallet';
import {ChartDataService} from '../../services/chart-data';
import {CustomValidator} from '../../validators/custom';
import {AuthService} from '../../services/auth';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/send/send.html',
  pipes: [TranslatePipe]
})
export class SendPage {
  contact: any;
  mainForm: FormGroup;
  availableBalance: number;
  estimatedFee: number;
  maxAmount: number;
  private wallet: WalletModel;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private translate: TranslateService,
    public chartData: ChartDataService,
    private ngZone: NgZone
  ) {
    this.contact = this.navParams.get('contact');
    this.mainForm = new FormGroup({
      amount: new FormControl('', [CustomValidator.numericRangeValidator, Validators.required]),
      message: new FormControl(''),
      maxAmount: new FormControl('')
    });
  }

  reflectMaxAmountOnPage() {
    this.availableBalance = this.chartData.balanceInfo.availableBalance;
    this.estimatedFee = this.chartData.balanceInfo.estimatedFee;
    this.maxAmount = this.chartData.balanceInfo.availableBalance.minus(this.chartData.balanceInfo.estimatedFee);
    CustomValidator.maxValidAmount = this.maxAmount;
    CustomValidator.minValidAmount = 0;
  }

  ngOnInit() {
    let self = this;
    if (self.chartData.balanceUpdated) {
      self.reflectMaxAmountOnPage();
    }
    self.chartData.balanceUpdatedEmitter.subscribe(() => {
      self.ngZone.run(() => {
        self.reflectMaxAmountOnPage();
      });
    });
  }

  missingAmount(): boolean {
    let control = this.mainForm.find('amount');
    return (control.touched || control.dirty) && control.hasError('required');
  }

  numberOutOfRange(): boolean {
    let control = this.mainForm.find('amount');
    return !this.missingAmount() && (control.touched || control.dirty) && control.hasError('numberOutOfRange');
  }

  sendUR() {
    let self = this;
    self.obtainAndValidateSecretPhrase().then(() => {
      return self.confirm();
    }).then(() => {
      return self.auth.checkFirebaseConnection();
    }).then((connected: boolean) => {
      if (!connected) {
        throw {message: 'Firebase Connection Error'};
      }
      return self.wallet.sendRawTransaction(self.contact.wallet.address, Number(self.mainForm.value.amount));
    }).then((urTransaction) => {
      let transactionRef = firebase.database().ref(`/users/${self.auth.currentUserId}/transactions/${urTransaction.hash}`);
      let transaction: any = {
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
        sender: _.merge(_.pick(self.auth.currentUser, ['name', 'profilePhotoUrl']), { userId: self.auth.currentUserId }),
        receiver: _.pick(self.contact, ['name', 'profilePhotoUrl', 'userId']),
        createdBy: 'UR Money',
        type: 'sent',
        amount: urTransaction.value,
        urTransaction: urTransaction
      };
      let message = _.trim(self.mainForm.value.message || '');
      if (message) {
        transaction.message = message;
      }
      return transactionRef.set(transaction);
    }).then(() => {
      self.showMessage('send.urSent');
      self.nav.setRoot(HomePage);
    }, (error: any) => {
      if (error.message && /CONNECTION ERROR|Firebase Error/i.test(error.message)) {
        self.showMessage('noInternetConnection');
        log.debug('no internet connection');
      } else if (error.displayMessage) {
        self.showMessage(null, error.displayMessage);
        log.debug(error.logMessage || error);
      } else if (error.logMessage === 'cancel clicked') {
        // do nothing
      } else {
        self.showMessage('send.errorMessage');
        log.debug(error.logMessage || error);
      }
      // give up trying to send
    });
  }

  showMessage(messageKey: string, messageText?: string) {
    this.toastCtrl.create({
      message: messageKey ? this.translate.instant(messageKey) : messageText,
      duration: 3000,
      position: 'bottom'
    }).present();
  }

  obtainAndValidateSecretPhrase() {
    let self = this;
    return new Promise((resolve, reject) => {
      let prompt = self.alertCtrl.create({
        title: this.translate.instant('send.secretPhrase'),
        message: this.translate.instant('send.enterSecret'),
        inputs: [{ type: 'password', name: 'secretPhrase', placeholder: this.translate.instant('send.secretPhrase')}], // value: 'apple apple apple apple apple'
        buttons: [
          {
            text: this.translate.instant('cancel'),
            role: 'cancel',
            handler: data => {
              reject({ logMessage: 'cancel clicked' });
            }
          },
          {
            text: this.translate.instant('continue'),
            handler: data => {
              let secretPhrase = data.secretPhrase;
              prompt.dismiss().then(() => {
                WalletModel.generate(secretPhrase, self.auth.currentUserId).then((data) => {
                  self.wallet = new WalletModel(data);
                  if (self.wallet.getAddress() === self.auth.currentUser.wallet.address) {
                    resolve();
                  } else {
                    reject({ displayMessage: this.translate.instant('send.phraseIncorrect') });
                  }
                }, (error) => {
                  let displayMessageKey = _.isString(error) && /CONNECTION ERROR/i.test(error) ? 'noInternetConnection' : 'send.errorMessage';
                  reject({
                    displayMessage: this.translate.instant(displayMessageKey),
                    logMessage: `cannot send UR: ${error}`
                  });
                });
              });
            }
          }
        ]
      });
      prompt.present().then(() => {
        let alertInput = jQuery('input.alert-input');
        alertInput.attr('autocapitalize', 'off');
        alertInput.attr('autocorrect', 'off');
      });
    });
  }

  confirm() {
    return new Promise((resolve, reject) => {
      let amount: number = Number(this.mainForm.value.amount); // add number:'1.2-2'
      let prompt = this.alertCtrl.create({
        title: this.translate.instant('send.confirmation'),
        message: `<p>${this.translate.instant('send.send')} ${amount} UR?</p>`,
        buttons: [
          {
            text: this.translate.instant('cancel'),
            role: 'cancel',
            handler: data => {
              reject({ logMessage: 'cancel clicked' });
            }
          },
          {
            text: this.translate.instant('ok'),
            handler: data => {
              prompt.dismiss().then(() => { resolve(); });
            }
          }
        ]
      });
      prompt.present();
    });
  }

  formatUR(amount: number): string {
    if (amount) {
      return (new BigNumber(amount)).toFormat(2);
    } else {
      return '';
    }
  }
}
