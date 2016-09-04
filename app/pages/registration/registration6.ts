import {ViewChild, ElementRef, Inject} from '@angular/core';
import {Page, NavController, Platform, AlertController, ToastController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES, FormGroup, FormControl, Validators} from '@angular/forms';
import {AngularFire} from 'angularfire2'
import * as _ from 'lodash';
import * as log from 'loglevel';

import {FocuserDirective} from '../../directives/focuser';
import {WalletModel} from '../../models/wallet';
import {AuthService} from '../../services/auth';
import {DeviceIdentityService} from '../../services/device-identity';
import {CustomValidator} from '../../validators/custom';
import {LoadingModalComponent} from '../../components/loading-modal/loading-modal';

import {HomePage} from '../home/home';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/registration/registration6.html',
  directives: [REACTIVE_FORM_DIRECTIVES, FocuserDirective]
})
export class Registration6Page {
  mainForm: FormGroup;
  errorMessage: string;
  profile: any;
  constructor(
    public nav: NavController,
    // public formBuilder: FormGroup,
    public auth: AuthService,
    public loadingModal: LoadingModalComponent,
    public deviceIdentityService: DeviceIdentityService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.mainForm = new FormGroup({
      secretPhrase: new FormControl("", CustomValidator.secretPhraseValidator)
    });
    this.profile = {
      secretPhrase: '',
    };
  }

  suggestSecretPhrase() {
    var secureRandword = require('secure-randword');
    this.profile.secretPhrase = secureRandword(5).join(' ');;
    this.mainForm.controls['secretPhrase'].markAsDirty();
  }

  submit() {
    let prompt = this.alertCtrl.create({
      title: 'Cnfirm secret phrase',
      message: "Please re-enter your secret phrase",
      inputs: [{ name: 'secretPhrase', placeholder: 'Secret Phrase' }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            log.debug("cancel clicked");
          }
        },
        {
          text: 'Continue',
          handler: data => {
            let secretPhrase = data.secretPhrase;
            if (data.secretPhrase == this.profile.secretPhrase) {
              this.confirmSecretPhraseWrittenDown();
            } else {
              // do nothing
            }
          }
        }
      ]
    });
    prompt.present().then(() => {
      let alertInput = jQuery("input.alert-input");
      alertInput.attr("autocapitalize", "off");
      alertInput.attr("autocorrect", "off");
    });
  }

  confirmSecretPhraseWrittenDown() {
    let alert = this.alertCtrl.create({
      title: 'Confirm secret phrase written',
      message: "Write your five word paraphrase down and store it someplace safe. UR Capital does not store your pass phrase and will NOT be able to recover it if it is lost or forgotten.",
      //" If you lose your passphrase, you will not be able to access your money ever again. ?',
      buttons: [
        { text: 'Cancel', handler: () => { alert.dismiss(); } },
        {
          text: 'OK', handler: () => {
            alert.dismiss().then(() => {
              this.generateAddress();
            });
          }
        }
      ]
    });
    alert.present();
  }

  generateAddress() {
    let self = this;
    self.loadingModal.show();
    WalletModel.generate(self.profile.secretPhrase, self.auth.currentUserId).then((walletData) => {
      let wallet: WalletModel = new WalletModel(walletData);
      self.profile.address = wallet.getAddress();
      self.saveWallet();
    }).catch((error) => {
      self.loadingModal.hide();
      log.warn('unable to get address!');
    });
  }

  saveWallet() {
    let self = this;
    self.auth.currentUserRef.update({
      wallet: {
        address: self.profile.address,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      }
    }).then(() => {
      self.loadingModal.hide();
      self.toastCtrl.create({
        message: 'Your account has been submitted for review. Once it is approved, you will receive 2,000 UR!',
        duration: 5000,
        position: 'bottom'
      }).present();
      self.nav.setRoot(HomePage);
    }).catch((error) => {
      self.loadingModal.hide();
      log.warn('unable to save profile and wallet info');
    });
  };
}
