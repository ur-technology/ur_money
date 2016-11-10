import {Page, AlertController, Content, NavController, NavParams, LoadingController} from 'ionic-angular';
import {NgZone, ViewChild} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {BigNumber} from 'bignumber.js';

import {HomePage} from '../home/home';
import {WalletModel} from '../../models/wallet';
import {ChartDataService} from '../../services/chart-data';
import {ToastService} from '../../services/toast';
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
  maxAmount: BigNumber;
  private wallet: WalletModel;
  private loadingModal: any;
  @ViewChild(Content) content: Content;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private toastService: ToastService,
    private loadingController: LoadingController,
    private auth: AuthService,
    private translate: TranslateService,
    public chartData: ChartDataService,
    private ngZone: NgZone
  ) {
    this.contact = this.navParams.get('contact');
    this.mainForm = new FormGroup({
      amount: new FormControl('', [CustomValidator.numericRangeValidator, Validators.required]),
      message: new FormControl(''),
      secretPhrase: new FormControl('', [Validators.required]),
      maxAmount: new FormControl('')
    });
  }

  reflectMaxAmountOnPage() {
    this.availableBalance = this.chartData.balanceInfo.availableBalance;
    this.estimatedFee = this.chartData.balanceInfo.estimatedFee;
    this.maxAmount = BigNumber.max(this.chartData.balanceInfo.availableBalance.minus(this.chartData.balanceInfo.estimatedFee), 0);
    CustomValidator.maxValidAmount = this.maxAmount.toNumber();
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

  missingSecretPhrase(): boolean {
    let control = this.mainForm.find('secretPhrase');
    return (control.touched || control.dirty) && control.hasError('required');
  }

  incorrectSecretPhrase(): boolean {
    let control = this.mainForm.find('secretPhrase');
    return !this.missingSecretPhrase() && (control.touched || control.dirty) && control.hasError('incorrectSecretPhrase');
  }

  showLoadingModal(): Promise<any> {
    this.loadingModal = this.loadingController.create({
      content: this.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });
    return this.loadingModal.present();
  }

  saveTransaction(urTransaction: any): Promise<any> {
    let transactionRef = firebase.database().ref(`/users/${this.auth.currentUserId}/transactions/${urTransaction.hash}`);
    let transaction: any = {
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      sender: _.merge(_.pick(this.auth.currentUser, ['name', 'profilePhotoUrl']), { userId: this.auth.currentUserId }),
      receiver: _.pick(this.contact, ['name', 'profilePhotoUrl', 'userId']),
      createdBy: 'UR Money',
      type: 'sent',
      amount: urTransaction.value,
      urTransaction: urTransaction
    };
    let message = _.trim(this.mainForm.value.message || '');
    if (message) {
      transaction.message = message;
    }
    return transactionRef.set(transaction);
  }

  sendUR() {
    let self = this;
    self.confirm().then(() => {
      return self.showLoadingModal();
    }).then(() => {
      return self.validateSecretPhrase();
    }).then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      return self.wallet.sendRawTransaction(self.contact.wallet.address, Number(self.mainForm.value.amount));
    }).then((urTransaction) => {
      return self.saveTransaction(urTransaction);
    }).then(() => {
      return self.loadingModal.dismiss();
    }).then(() => {
      self.nav.setRoot(HomePage);
      return self.toastService.showMessage({ messageKey: 'send.urSent' });
    }, (error: any) => {
      self.loadingModal.dismiss().then(() => {
        if (error.messageKey === 'canceled') {
          // do nothing
        } else {
          let messageKey = 'unexpectedErrorMessage';
          if (_.isString(error.message) && /CONNECTION ERROR/i.test(error.message)) {
            messageKey = 'noInternetConnection';
          } else if (error.messageKey) {
            messageKey = error.messageKey;
          }
          self.toastService.showMessage({ messageKey: messageKey });
          if (!error.messageKey) {
            log.debug(error.message || error);
          }
          // give up trying to send
        }
      });
    });
  }

  validateSecretPhrase() {
    let self = this;
    return new Promise((resolve, reject) => {
      WalletModel.generate(self.mainForm.value.secretPhrase, self.auth.currentUserId).then((data) => {
        self.wallet = new WalletModel(data);
        if (self.wallet.getAddress() === self.auth.currentUser.wallet.address) {
          resolve();
        } else {
          reject({ messageKey: 'send.incorrectSecretPhrase' });
        }
      }, (error) => {
        let message = `cannot generate wallet: ${error}`;
        log.warn(message);
        reject({ message: message });
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
              log.debug('send canceled');
              reject({ messageKey: 'canceled' });
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

  focusInput() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 500);
  }
}
