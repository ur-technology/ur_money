import {ViewChild, ElementRef, Inject} from '@angular/core';
import {Page, NavController, Platform, AlertController, ToastController, LoadingController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES, FormGroup, FormControl, Validators} from '@angular/forms';
import {AngularFire} from 'angularfire2'
import * as _ from 'lodash';
import * as log from 'loglevel';

import {FocuserDirective} from '../../directives/focuser';
import {WalletModel} from '../../models/wallet';
import {AuthService} from '../../services/auth';
import {DeviceIdentityService} from '../../services/device-identity';
import {CustomValidator} from '../../validators/custom';
import {HomePage} from '../home/home';
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";

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
      secretPhrase: new FormControl("", CustomValidator.secretPhraseValidator)
    });
    this.profile = {
      secretPhrase: '',
    };
    this.loadingModal = this.loadingController.create({
      content: this.translate.instant("pleaseWait"),
      dismissOnPageChange: true
    });
  }

  suggestSecretPhrase() {
    var secureRandword = require('secure-randword');
    this.profile.secretPhrase = secureRandword(5).join(' ');;
    this.mainForm.controls['secretPhrase'].markAsDirty();
  }

  submit() {
    let prompt = this.alertCtrl.create({
      title: this.translate.instant("wallet-setup.alertTitle"),
      message: this.translate.instant("wallet-setup.messageAlert"),
      inputs: [{ name: 'secretPhrase', placeholder: this.translate.instant("wallet-setup.secretPhrase") }],
      buttons: [
        {
          text: this.translate.instant("cancel"),
          role: 'cancel',
          handler: data => {
            log.debug("cancel clicked");
          }
        },
        {
          text: this.translate.instant("continue"),
          handler: data => {
            prompt.dismiss().then(() => {
              let secretPhrase = data.secretPhrase;
              if (data.secretPhrase == this.profile.secretPhrase) {
                this.confirmSecretPhraseWrittenDown();
              } else {
                // do nothing
              }
            });
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
      title: this.translate.instant("wallet-setup.titleConfirm"),
      message: this.translate.instant("wallet-setup.messagePhrase"),
      //" If you lose your passphrase, you will not be able to access your money ever again. ?',
      buttons: [
        { text: this.translate.instant("cancel"), handler: () => { alert.dismiss(); } },
        {
          text: this.translate.instant("ok"), handler: () => {
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
    self.loadingModal.present();
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
    self.auth.currentUserRef.update({
      wallet: {
        address: self.profile.address,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      }
    }).then(() => {
      self.loadingModal.dismiss().then(()=>{
        self.toastCtrl.create({
          message: this.translate.instant("wallet-setup.messageSave"),
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
