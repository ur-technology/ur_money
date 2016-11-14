import {Page, NavController, AlertController, ToastController, LoadingController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES, FormGroup, FormControl} from '@angular/forms';
import * as firebase from 'firebase';
import * as log from 'loglevel';
import { NativeStorage } from 'ionic-native';
import {FocuserDirective} from '../../directives/focuser';
import {WalletModel} from '../../models/wallet';
import {AuthService} from '../../services/auth';
import {ContactsService} from '../../services/contacts';
import {CustomValidator} from '../../validators/custom';
import {HomePage} from '../home/home';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {KeyboardAttachDirective} from '../../directives/keyboard-attach.directive';
import {EncryptionService} from '../../services/encryption';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/registration/wallet-setup.html',
  directives: [REACTIVE_FORM_DIRECTIVES, FocuserDirective, KeyboardAttachDirective],
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
    public contactsService: ContactsService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingController: LoadingController,
    private translate: TranslateService,
    private encryptionService: EncryptionService
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
      NativeStorage.clear().then(() => {
        self.savePassPhrase().then(() => {
          self.saveWallet();
        });
      });
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
    let alert = this.alertCtrl.create({
      message: `If you forgot your secret phrase you can recover it later`,
      buttons: ['Ok']
    });
    alert.present();
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
        self.contactsService.loadContacts(self.auth.countryCode, self.auth.currentUserId, self.auth.currentUser.phone);
        self.nav.setRoot(HomePage);
      });
    }).catch((error) => {
      self.loadingModal.dismiss();
      log.warn('unable to save profile and wallet info');
    });
  }
}
