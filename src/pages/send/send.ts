import { AlertController, Content, NavController, NavParams, Platform, LoadingController, ModalController} from 'ionic-angular';
import { ViewChild, Inject, Component} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import { FirebaseApp } from 'angularfire2';
import * as log from 'loglevel';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {BigNumber} from 'bignumber.js';
import {NativeStorage} from 'ionic-native';
import {HomePage} from '../home/home';
import {WalletModel} from '../../models/wallet';
import {ChartDataService} from '../../services/chart-data';
import {ToastService} from '../../services/toast';
import {CustomValidator} from '../../validators/custom';
import {AuthService} from '../../services/auth';
import {EncryptionService} from '../../services/encryption';
import {ChooseContactPage} from '../choose-contact/choose-contact';
declare var jQuery: any;

@Component({
  templateUrl: 'send.html',
})
export class SendPage {
  contact: any;
  walletAddress: string;
  mainForm: FormGroup;
  availableBalance: any = new BigNumber(0);
  estimatedFee: any = new BigNumber(0);
  maxAmount: any = new BigNumber(0);
  private wallet: WalletModel;
  private loadingModal: any;
  private phraseSaved;
  refreshIntervalId: any;
  @ViewChild(Content) content: Content;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public alertCtrl: AlertController,
    public toastService: ToastService,
    public loadingController: LoadingController,
    public auth: AuthService,
    public translate: TranslateService,
    public chartData: ChartDataService,
    public encryptionService: EncryptionService,
    public modalController: ModalController,
    @Inject(FirebaseApp) firebase: any
  ) {
    this.mainForm = new FormGroup({
      amount: new FormControl('', [CustomValidator.numericRangeValidator, Validators.required]),
      message: new FormControl(''),
      secretPhrase: new FormControl('', [Validators.required]),
      maxAmount: new FormControl(''),
      addressWallet: new FormControl('', [Validators.required, this.validateAddressField]),
      contact: new FormControl('', [Validators.required])
    });
  }

  reflectMaxAmountOnPage() {
    this.availableBalance = this.chartData.balanceInfo.availableBalance;
    this.estimatedFee = this.chartData.balanceInfo.estimatedFee;
    this.maxAmount = BigNumber.max(this.chartData.balanceInfo.availableBalance.minus(this.chartData.balanceInfo.estimatedFee), 0);
    CustomValidator.maxValidAmount = this.maxAmount.toNumber();
    CustomValidator.minValidAmount = 0;
  }

  chooseContact() {
    let self = this;
    let chooseModal = this.modalController.create(ChooseContactPage, {walletAddress: self.walletAddress});
    chooseModal.onDidDismiss(data => {
      self.contact = null;
      self.walletAddress = null;
      if (data.contact) {
        self.contact = data.contact;
        (<FormControl>this.mainForm.controls['contact']).setValue(self.contact.name);
        (<FormControl>this.mainForm.controls['addressWallet']).setErrors(null);
      } else {
        self.walletAddress = data.walletAddress;
        (<FormControl>this.mainForm.controls['addressWallet']).setValue(self.walletAddress);
        (<FormControl>this.mainForm.controls['contact']).setErrors(null);
      }
    });
    chooseModal.present();
  }

  validateAddressField(control) {
    if (control && control.value) {
      if (!WalletModel.validateAddressFormat(control.value)) {
        return { 'invalidAddress': true };
      }
    }
  }

  ngOnInit() {
    let self = this;
    if (self.platform.is('cordova')) {
      NativeStorage.getItem('phrase').then(data => {
        let value = self.encryptionService.decrypt(data.property);
        self.phraseSaved = value;
      }, error => {
        self.phraseSaved = null;
      });
    }
    if (self.chartData.balanceUpdated) {
      self.reflectMaxAmountOnPage();
    }
    self.chartData.balanceUpdatedEmitter.subscribe(() => {
      self.reflectMaxAmountOnPage();
    });
  }

  incorrectToField(): boolean {
    let control = this.mainForm.get('addressWallet');
    return (control.touched || control.dirty) && control.hasError('invalidAddress');
  }

  missingAmount(): boolean {
    let control = this.mainForm.get('amount');
    return (control.touched || control.dirty) && control.hasError('required');
  }

  numberOutOfRange(): boolean {
    let control = this.mainForm.get('amount');
    return !this.missingAmount() && (control.touched || control.dirty) && control.hasError('numberOutOfRange');
  }

  missingSecretPhrase(): boolean {
    let control = this.mainForm.get('secretPhrase');
    return (control.touched || control.dirty) && control.hasError('required');
  }

  incorrectSecretPhrase(): boolean {
    let control = this.mainForm.get('secretPhrase');
    return !this.missingSecretPhrase() && (control.touched || control.dirty) && control.hasError('incorrectSecretPhrase');
  }

  showLoadingModal(): Promise<any> {
    this.loadingModal = this.loadingController.create({
      content: this.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });
    return this.loadingModal.present();
  }

  saveTransaction(urTransaction: any): any {
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
      let address = self.contact ? self.contact.wallet.address : self.walletAddress;
      return self.wallet.sendRawTransaction(address, Number(self.mainForm.value.amount));
    }).then((urTransaction) => {
      return self.saveTransaction(urTransaction);
    }).then(() => {
      return self.loadingModal.dismiss();
    }).then(() => {
      self.nav.setRoot(HomePage);
      return self.toastService.showMessage({ messageKey: 'send.urSent' });
    }, (error: any) => {
      self.loadingModal && self.loadingModal.dismiss().then(() => {
        if (error.messageKey === 'canceled') {
          // do nothing
        } else if (error.messageKey === 'send.incorrectSecretPhrase') {
          if (this.phraseSaved) {
            let alert = this.alertCtrl.create({
              title: 'Secret phrase incorrect',
              message: 'Did you forget the secret phrase? Tap Recover to show your secret phrase.',
              buttons: [{
                text: 'Cancel',
                role: 'cancel'
              },
                {
                  text: 'Recover',
                  handler: () => {

                    alert.dismiss().then(() => {
                      this.countDown();
                    });
                  }
                }]
            });
            alert.present();
          } else {
            self.toastService.showMessage({ messageKey: error.messageKey });
          }

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


  countDown() {
    let self = this;


    let countDownAlert = this.alertCtrl.create({
      title: 'Recovering Secret Phrase',
      message: `<p class='seconds-remaining'><span>60</span> seconds remaining...</p><p class='secret-phrase' hidden>${this.phraseSaved}</p>`,
      buttons: [{
        text: 'Cancel',
        handler: () => {
          clearInterval(this.refreshIntervalId);
          countDownAlert.dismiss();
        }
      }]
    });
    countDownAlert.present().then(() => {
      let secondsRemaining: number = 60;
      let secondsRemainingDisplay = jQuery('.alert-message p.seconds-remaining span');

      self.refreshIntervalId = setInterval(function() {
        secondsRemainingDisplay.text(secondsRemaining.toString());

        if (--secondsRemaining <= 0) {
          clearInterval(self.refreshIntervalId);
          countDownAlert.dismiss().then(() => {
            self.confirmSecretPhraseWrittenDown();
          });
        }
      }, 1000);
    });
  }

  confirmSecretPhraseWrittenDown() {
    let message1 = this.translate.instant('wallet-setup.confirmWrittenDownMessage1');
    let message2 = this.translate.instant('wallet-setup.confirmWrittenDownMessage2');
    let message3 = this.translate.instant('wallet-setup.confirmWrittenDownMessage3');
    let alert = this.alertCtrl.create({
      title: this.translate.instant('wallet-setup.confirmWrittenDownTitle'),
      message: `<p>${message1}</p><p><b>${this.phraseSaved}</b></p><p>${message2}</p><p>${message3}</p>`,
      buttons: [
        {
          text: this.translate.instant('wallet-setup.confirmWrittenDownButton'), handler: () => {
            alert.dismiss().then(() => {
              this.mainForm.value.secretPhrase = '';
            });
          }
        }
      ]
    });
    alert.present();
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
              prompt.dismiss();
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
}
