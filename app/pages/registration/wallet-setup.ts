import {Page, NavController, AlertController, ToastController, LoadingController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES, FormGroup, FormControl} from '@angular/forms';
import * as firebase from 'firebase';
import * as log from 'loglevel';

import {FocuserDirective} from '../../directives/focuser';
import {WalletModel} from '../../models/wallet';
import {AuthService} from '../../services/auth';
import {DeviceIdentityService} from '../../services/device-identity';
import {CustomValidator} from '../../validators/custom';
import {HomePage} from '../home/home';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import { Keyboard } from 'ionic-native';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/registration/wallet-setup.html',
  directives: [REACTIVE_FORM_DIRECTIVES, FocuserDirective],
  pipes: [TranslatePipe]
})
export class WalletSetupPage {
  mainForm: FormGroup;
  errorMessage: string;
  profile: any;
  loadingModal: any;

  constructor(
    public nav: NavController,
    public auth: AuthService,
    public deviceIdentityService: DeviceIdentityService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController, private loadingController: LoadingController,  private translate: TranslateService
  ) {
    this.mainForm = new FormGroup({
      secretPhrase: new FormControl('', CustomValidator.secretPhraseValidator)
    });
    this.profile = {
      secretPhrase: '',
    };
    this.loadingModal = this.loadingController.create({
      content: this.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });
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
              this.reenterSecretPhrase();
            });
          }
        }
      ]
    });
    alert.present();
  }

  reenterSecretPhrase(retrying?) {
    let message = this.translate.instant('wallet-setup.reenterSecretPhraseMessage');
    if (retrying) {
      message = `<p class='incorrect-secret-phrase'>${ this.translate.instant('wallet-setup.renterSecretPhraseRetryMessage') }</p><p>${message}</p>`;
    }
    let prompt = this.alertCtrl.create({
      title: this.translate.instant('wallet-setup.reenterSecretPhraseTitle'),
      message: message,
      inputs: [{ type: 'password', name: 'secretPhrase', placeholder: this.translate.instant('wallet-setup.renterSecretPhrasePlaceholder') }],
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          handler: data => {
            // do nothing
          }
        },
        {
          text: this.translate.instant('continue'),
          handler: data => {
            prompt.dismiss().then(() => {
              if (data.secretPhrase === this.profile.secretPhrase) {
                Keyboard.close();
                this.loadingModal.present().then(() => {
                  this.generateAddress();
                });
              } else {
                setTimeout(() => {
                  this.reenterSecretPhrase(true);
                }, 1);
                return false;
              }
            });
          }
        }
      ]
    });
    prompt.present();
  }

  generateAddress() {
    let self = this;
    WalletModel.generate(self.profile.secretPhrase, self.auth.currentUserId).then((walletData) => {
      let wallet: WalletModel = new WalletModel(walletData);
      self.profile.address = wallet.getAddress();
      self.saveWallet();
    }).catch((error) => {
      self.loadingModal.dismiss();
      log.warn('unable to get address!');
    });
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
      firebase.database().ref('/identityAnnouncementQueue/tasks').push({
        userId: this.auth.currentUserId
      });
      self.loadingModal.dismiss().then(() => {
        self.toastCtrl.create({
          message: this.translate.instant('wallet-setup.youWillReceiveBonus'),
          duration: 5000,
          position: 'bottom'
        }).present();
        self.nav.setRoot(HomePage);
      });
    }).catch((error) => {
      self.loadingModal.dismiss();
      log.warn('unable to save profile and wallet info');
    });
  };
}
