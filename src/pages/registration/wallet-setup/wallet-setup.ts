import { NavController, Platform, AlertController, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as log from 'loglevel';
import { WalletModel } from '../../../models/wallet';
import { AuthService } from '../../../services/auth';
import { CustomValidator } from '../../../validators/custom';
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
      content: "Please wait...",
      dismissOnPageChange: true
    });
    this.configPlatform = Config.targetPlatform;
  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
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
      title: "Confirm your secret phrase",
      message: "Please confirm your secret phrase by re-entering it. Once you've entered it correctly here you won't be able to see it again, so make sure you've recorded it in an appropriate way.",
      inputs: [
        {
          name: 'passphrase',
          type: 'password',
          placeholder: "Secret phrase"
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            alert.dismiss();
            return false;
          }
        },
        {
          text: "Ok",
          handler: (data) => {
            if (data.passphrase === self.profile.secretPhrase) {
              alert.dismiss().then(() => {
                self.loadingModal.present().then(() => {
                  self.generateAddress();
                });
              });
            } else {
              alert.dismiss().then(() => {
                self.toastService.showMessage({ message: "The secret phrase you re-entered is incorrect. Please try again." });
              });
            }
            return false;
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
      self.saveWallet();
    }).catch((error) => {
      self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error Generate wallet Address', 'generateAddress()');
      self.loadingModal.dismiss();
      log.warn('unable to get address!');
    });
  }

  alertSecretPhrase() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Alert secret phrase', 'alertSecretPhrase()');
    let alerta = this.alertCtrl.create({
      message: "By checking this box, you are choosing to store your your secret phrase on your device. This approach to safeguarding your secret phrase has advantages and disadvantages. The main advantage is that, if your forget your secret phrase and also lose your written copy of it, you will usually be able to recover it using this approach. The main disadvantage is that you could increase the chances of having your secret phrase stolen if someone gets physical or remote access to your device. Furthermore, saving your secret phrase to your device is NOT 100% reliable, so please continue to write down your secret phrase and store it in a safe place.",
      buttons: [{
        text: "OK",
        handler: () => {
          alerta.dismiss();
          return false;
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
