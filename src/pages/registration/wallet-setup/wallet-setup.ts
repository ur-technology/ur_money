import { NavController, Platform, AlertController, ToastController, LoadingController} from 'ionic-angular';
import { Inject, Component } from '@angular/core';
import { FormGroup, FormControl} from '@angular/forms';
import { FirebaseApp } from 'angularfire2';
import * as log from 'loglevel';
import {NativeStorage} from 'ionic-native';
import {WalletModel} from '../../../models/wallet';
import {AuthService} from '../../../services/auth';
import {ContactsService} from '../../../services/contacts';
import {CustomValidator} from '../../../validators/custom';
import {HomePage} from '../../home/home';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {EncryptionService} from '../../../services/encryption';
import {Config} from '../../../config/config';

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
  configPlatform : string;

  constructor(
    public nav: NavController,
    public auth: AuthService,
    public contactsService: ContactsService,
    public platform: Platform,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public encryptionService: EncryptionService,
    @Inject(FirebaseApp) firebase: any
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

  suggestSecretPhrase() {
    var secureRandword = require('secure-randword');
    this.profile.secretPhrase = secureRandword(5).join(' ');
    this.mainForm.controls['secretPhrase'].markAsDirty();
    return false;
  }

  confirmSecretPhraseWrittenDown() {
    let message1 = this.translate.instant('wallet-setup.confirmWrittenDownMessage1');
    let message2 = this.translate.instant('wallet-setup.confirmWrittenDownMessage2');
    let message3 = this.translate.instant('wallet-setup.confirmWrittenDownMessage3');
    let alert = this.alertCtrl.create({
      title: this.translate.instant('wallet-setup.confirmWrittenDownTitle'),
      message: `<p>${message1}</p><p><b>${this.profile.secretPhrase}</b></p><p>${message2}</p><p>${message3}</p>`,
      buttons: [
        { text: this.translate.instant('cancel'), handler: () => { alert.dismiss(); } },
        {
          text: this.translate.instant('wallet-setup.confirmWrittenDownButton'), handler: () => {
            alert.dismiss().then(() => {
              this.loadingModal.present().then(() => {
                this.generateAddress();
              });
            });
          }
        }
      ]
    });
    alert.present();
  }

  generateAddress() {
    let self = this;

    WalletModel.generate(self.profile.secretPhrase, self.auth.currentUserId).then((walletData) => {
      let wallet: WalletModel = new WalletModel(walletData);
      self.profile.address = wallet.getAddress();
      if (self.platform.is('cordova')) {
        NativeStorage.clear().then(() => {
          self.savePassPhrase().then(() => {
            self.saveWallet();
          });
        });
      } else {
        self.saveWallet();
      }
    }).catch((error) => {
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
            resolve();
          },
          error => {
            resolve();
          }
          );
      } else {
        resolve();
      }
    });
  }

  alertSecretPhrase() {
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
    self.auth.currentUserRef.update({
      wallet: {
        address: self.profile.address,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      }
    }).then(() => {
      self.loadingModal.dismiss().then(() => {
        firebase.database().ref('/identityAnnouncementQueue/tasks').push({
          userId: this.auth.currentUserId
        });
        self.contactsService.loadContacts(self.auth.currentUserId, self.auth.currentUser.phone, self.auth.currentUser.countryCode);
        self.nav.setRoot(HomePage);
      });
    }).catch((error) => {
      self.loadingModal.dismiss();
      log.warn('unable to save profile and wallet info');
    });
  }
}
