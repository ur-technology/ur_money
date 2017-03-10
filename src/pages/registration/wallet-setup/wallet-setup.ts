import { NavController, Platform, AlertController, LoadingController } from 'ionic-angular';
import { Inject, Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FirebaseApp } from 'angularfire2';
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
import { File, FileOpener } from 'ionic-native';
import { Utils } from '../../../services/utils';
declare var jQuery: any;
declare var jsPDF: any;
declare var cordova: any

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

  constructor(
    public nav: NavController,
    public auth: AuthService,
    public platform: Platform,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public encryptionService: EncryptionService,
    private toastService: ToastService,
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
    let self = this;

    let alert = self.alertCtrl.create({
      title: self.translate.instant('wallet-setup.reenterSecretPhraseTitle'),
      message: self.translate.instant('wallet-setup.reenterSecretPhraseMessage'),
      inputs: [
        {
          name: 'passphrase',
          type: 'password',
          placeholder: self.translate.instant('wallet-setup.renterSecretPhrasePlaceholder')
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
          text: self.translate.instant('wallet-setup.okValidate'),
          handler: (data) => {
            if (data.passphrase === self.profile.secretPhrase) {
              alert.dismiss().then(() => {
                self.loadingModal.present().then(() => {
                  return self.generatePDF();
                }).then(() => {
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


  generatePDF(): Promise<any> {
    let self = this;

    return new Promise((resolve, reject) => {
      let imgLogo = Utils.imageLogoBase64;
      let imgSlogan = Utils.imageSloganBase64;
      var doc = new jsPDF();

      doc.addImage(imgLogo, 'JPEG', 60, 20, 85, 34, undefined, 'none');
      doc.addImage(imgSlogan, 'jpg', 80, 55, 55, 9, undefined, 'none');
      doc.setFontSize(12);
      doc.text(10, 80, self.translate.instant('wallet-setup.pdfMessage1'));
      doc.setFontSize(15);
      doc.text(10, 100, self.profile.secretPhrase);
      doc.setFontSize(12);
      doc.text(10, 120, self.translate.instant('wallet-setup.pdfMessage2'));
      doc.text(10, 130, self.translate.instant('wallet-setup.pdfMessage3'));
      doc.text(10, 150, 'UR Money');
      let fileName = 'passphrase.pdf';

      if (self.platform.is('android')) {

        let data = doc.output();
        var buffer = new ArrayBuffer(data.length);
        var array = new Uint8Array(buffer);
        for (var i = 0; i < data.length; i++) {
          array[i] = data.charCodeAt(i);
        }

        var blob = new Blob(
          [array], {
            type: 'application/pdf'
          }
        );
        let dataDirectory: string = cordova.file.externalDataDirectory;
        File.writeFile(dataDirectory, fileName, blob, { replace: true, append: false })
          .then((data: any) => {
            return FileOpener.open(data.nativeURL, 'application/pdf');
          })
          .then((data: any) => {
            resolve();
          })
          .catch(err => {
            resolve();
          });
      } else {
        doc.save(fileName);
        resolve();
      }

    });
  }

  generateAddress() {
    let self = this;

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
        self.nav.setRoot(IntroPage);
      });
    }).catch((error) => {
      self.loadingModal.dismiss();
      log.warn('unable to save profile and wallet info');
    });
  }
}
