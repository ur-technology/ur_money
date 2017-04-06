import { AlertController, NavController, NavParams, Platform, LoadingController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { BigNumber } from 'bignumber.js';
import { NativeStorage } from 'ionic-native';
import { HomePage } from '../home/home';
import { WalletModel } from '../../models/wallet';
import { ChartDataService } from '../../services/chart-data.service';
import { ToastService } from '../../services/toast';
import { CustomValidator } from '../../validators/custom';
import { AuthService } from '../../services/auth';
import { EncryptionService } from '../../services/encryption';
import { Config } from '../../config/config';
import { ChooseContactPage } from '../choose-contact/choose-contact';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';
declare var jQuery: any;

@Component({
  templateUrl: 'send.html',
})
export class SendPage {
  contact: any;
  mainForm: FormGroup;
  availableBalanceUR: any = new BigNumber(0);
  maxAmountUR: any = new BigNumber(0);
  userVerified: boolean;
  private wallet: WalletModel;
  private loadingModal: any;
  private phraseSaved;
  refreshIntervalId: any;
  public placeholderSentTo: string;
  public sendInProgress: boolean = false;
  pageName = 'SendPage';

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
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.mainForm = new FormGroup({
      amount: new FormControl('', [CustomValidator.numericRangeValidator, Validators.required]),
      secretPhrase: new FormControl('', [Validators.required]),
      addressWallet: new FormControl('', [Validators.required, CustomValidator.validateAddressField]),
      contact: new FormControl('', [Validators.required])
    });
    this.placeholderSentTo = Config.targetPlatform === 'web' ? this.translate.instant('send.placeholderSentToWeb') : this.translate.instant('send.placeholderSentTo');
    this.userVerified = auth.currentUser.isVerified();
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  reflectMaxAmountOnPage() {
    let availableBalanceWei = this.auth.currentBalanceWei().plus(this.chartData.pendingSentAmountWei());
    this.availableBalanceUR = availableBalanceWei.dividedBy(1000000000000000000).round(2, BigNumber.ROUND_HALF_FLOOR);
    this.maxAmountUR = BigNumber.max(this.availableBalanceUR.minus(this.chartData.estimatedFeeUR), 0).round(2, BigNumber.ROUND_HALF_FLOOR);
    CustomValidator.maxValidAmount = this.maxAmountUR.toNumber();
    CustomValidator.minValidAmount = new BigNumber(0.000000000000000001).toNumber();
  }

  chooseContact() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Show choose contact modal', 'chooseContact()');
    if (Config.targetPlatform !== 'web') {
      let chooseModal = this.modalController.create(ChooseContactPage, { walletAddress: this.mainForm.controls['addressWallet'].value });
      chooseModal.onDidDismiss(data => {
        if (data) {
          self.contact = null;
          if (data.contact) {
            self.contact = data.contact;
            (<FormControl>this.mainForm.controls['contact']).setValue(self.contact.name);
            (<FormControl>this.mainForm.controls['addressWallet']).setErrors(null);
          } else {
            (<FormControl>this.mainForm.controls['addressWallet']).setValue(data.walletAddress);
            (<FormControl>this.mainForm.controls['contact']).setErrors(null);
          }
        }
      });
      chooseModal.present();
    }
    if (Config.targetPlatform === 'web') {
      (<FormControl>this.mainForm.controls['contact']).setErrors(null);
    }
  }

  ngOnInit() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Init page', 'ngOnInit()');
    if (self.platform.is('cordova')) {
      NativeStorage.getItem('phrase').then(data => {
        let value = self.encryptionService.decrypt(data.property);
        self.phraseSaved = value;
      }, error => {
        self.phraseSaved = null;
      });
    }
    if (self.chartData.pointsLoaded) {
      self.reflectMaxAmountOnPage();
    }
    self.chartData.pointsLoadedEmitter.subscribe(() => {
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
      receiver: this.contact ? _.pick(this.contact, ['name', 'profilePhotoUrl', 'userId']) : { name: 'Unknown Recipient"' },
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
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Clicked on Send ur button', 'sendUR()');
    self.sendInProgress = true;
    self.confirm().then(() => {
      return self.showLoadingModal();
    }).then(() => {
      return self.validateSecretPhrase();
    }).then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      let address = self.contact ? self.contact.wallet.address : self.mainForm.controls['addressWallet'].value;
      address = WalletModel.prefixAddress(address);
      return self.wallet.sendRawTransaction(address, Number(self.mainForm.value.amount));
    }).then((urTransaction) => {
      return self.saveTransaction(urTransaction);
    }).then(() => {
      self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Send UR succeeded. Go to Home page', 'sendUR()');
      self.nav.setRoot(HomePage);
      return self.toastService.showMessage({ messageKey: 'send.urSent' });
    }).then(() => {
      return self.loadingModal.dismiss();
    }, (error: any) => {
      self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error sending UR', 'sendUR()');
      self.sendInProgress = false;
      self.loadingModal && self.loadingModal.dismiss().then(() => {
        if (error.messageKey === 'canceled') {
          // do nothing
        } else if (error.messageKey === 'send.incorrectSecretPhrase') {
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error sending UR. Passphrase incorrect', 'sendUR()');
          if (self.phraseSaved) {
            self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Going to show saved passphrase modal', 'sendUR()');
            let alert = self.alertCtrl.create({
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
                      self.countDown();
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
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error sending UR' + messageKey, 'sendUR()');
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
      let prompt = this.alertCtrl.create({
        title: this.translate.instant('send.confirmation'),
        message: `<p>${this.translate.instant('send.send')} ${this.mainForm.value.amount} UR?</p>`,
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
