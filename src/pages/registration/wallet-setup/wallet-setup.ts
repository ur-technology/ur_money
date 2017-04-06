import { NavController, Platform, AlertController, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as log from 'loglevel';
import { NativeStorage } from 'ionic-native';
import { WalletModel } from '../../../models/wallet';
import { AuthService } from '../../../services/auth';
import { CustomValidator } from '../../../validators/custom';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { EncryptionService } from '../../../services/encryption';
import { Config } from '../../../config/config';
import { IntroPage } from '../intro/intro'
import * as firebase from 'firebase';
import { ToastService } from '../../../services/toast';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';
declare var jQuery: any;

@Component({
  selector: 'wallet-setup-page',
  templateUrl: 'wallet-setup.html',
})
export class WalletSetupPage {
  mainForm: FormGroup;
  errorMessage: string;
  profile: any;
  loadingModal: any;
  configPlatform: string;
  pageName = 'WalletSetupPage';

  constructor(
    public nav: NavController,
    public auth: AuthService,
    public platform: Platform,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public encryptionService: EncryptionService,
    private toastService: ToastService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.mainForm = new FormGroup({
      secretPhrase: new FormControl('', CustomValidator.secretPhraseValidator),
      savePhrase: new FormControl('true')
    });
    this.profile = {
      secretPhrase: '',
    };
    this.loadingModal = this.loadingController.create({
      content: this.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });
    this.configPlatform = Config.targetPlatform;
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  suggestSecretPhrase() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Suggest secret phrase ', 'suggestSecretPhrase()');
    var secureRandword = require('secure-randword');
    this.profile.secretPhrase = secureRandword(5).join(' ');
    this.mainForm.controls['secretPhrase'].markAsDirty();
    return false;
  }

  confirmSecretPhraseWrittenDown() {
    let self = this;

    let alert = self.alertCtrl.create({
      title: self.translate.instant('wallet-setup.reenterSecretPhraseTitle'),
      message: self.translate.instant('wallet-setup.reenterSecretPhraseMessage'),
      inputs: [
        {
          name: 'passphrase',
          type: 'password',
          placeholder: self.translate.instant('wallet-setup.secretPhrase')
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: self.translate.instant('ok'),
          handler: (data) => {
            if (data.passphrase === self.profile.secretPhrase) {
              alert.dismiss().then(() => {
                self.loadingModal.present().then(() => {
                  self.generateAddress();
                });
              });
            } else {
              alert.dismiss().then(() => {
                self.toastService.showMessage({ messageKey: 'wallet-setup.secretPhraseIncorrect' });
              });
            }

          }
        }
      ]
    });
    alert.present();
  }

  generateAddress() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Generate wallet Address', 'generateAddress()');

    WalletModel.generate(self.profile.secretPhrase, self.auth.currentUserId).then((walletData) => {
      let wallet: WalletModel = new WalletModel(walletData);
      self.profile.address = wallet.getAddress();
      if (self.platform.is('android')) {
        NativeStorage.clear().then(() => {
          self.savePassPhrase().then(() => {
            self.saveWallet();
          });
        });
      } else {
        self.saveWallet();
      }
    }).catch((error) => {
      self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error Generate wallet Address', 'generateAddress()');
      self.loadingModal.dismiss();
      log.warn('unable to get address!');
    });
  }

  private savePassPhrase() {
    let self = this;

    return new Promise((resolve, reject) => {
      if ((self.mainForm.value.savePhrase === 'true') || (self.mainForm.value.savePhrase)) {
        let valueEncrypted = self.encryptionService.encrypt(self.mainForm.value.secretPhrase);
        NativeStorage.setItem('phrase', { property: valueEncrypted })
          .then(
          () => {
            self.googleAnalyticsEventsService.emitEvent(self.pageName, 'PassPhrase saved in device', 'savePassPhrase()');
            resolve();
          },
          error => {
            self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error saving PassPhrase in device', 'savePassPhrase()');
            resolve();
          }
          );
      } else {
        resolve();
      }
    });
  }

  alertSecretPhrase() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Alert secret phrase', 'alertSecretPhrase()');
    let alerta = this.alertCtrl.create({
      message: this.translate.instant('wallet-setup.learnSavePhrase'),
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          alerta.dismiss();
        }
      }
      ]
    });
    alerta.present();
  }

  saveWallet() {
    let self = this;
    self.auth.currentUser.wallet = {
      address: self.profile.address
    };
    self.auth.currentUser.update({
      wallet: {
        address: self.profile.address,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      }
    }).then(() => {
      self.loadingModal.dismiss().then(() => {
        firebase.database().ref('/walletCreatedQueue/tasks').push({
          userId: this.auth.currentUserId
        }).then();
        self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Set root page IntroPage', 'saveWallet()');
        self.nav.setRoot(IntroPage);
      });
    }).catch((error) => {
      self.loadingModal.dismiss();
      log.warn('unable to save profile and wallet info');
    });
  }
}
