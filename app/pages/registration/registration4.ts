import {ViewChild, ElementRef} from '@angular/core';
import {Page, NavController, NavParams, Alert} from 'ionic-angular';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators} from '@angular/common';
import {CustomValidators} from '../../components/custom-validators/custom-validators';
import {Auth} from '../../components/auth/auth';
import {LoadingModal} from '../../components/loading-modal/loading-modal';
import {HomePage} from '../home/home';
import {AngularFire} from 'angularfire2'
import {Focuser} from '../../components/focuser/focuser';

@Page({
  templateUrl: 'build/pages/registration/registration4.html',
  directives: [FORM_DIRECTIVES, Focuser]
})
export class Registration4Page {
  walletForm: ControlGroup;
  errorMessage: string;
  secretPhrase: string;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public auth: Auth,
    public loadingModal: LoadingModal,
    public angularFire: AngularFire
  ) {
    this.secretPhrase = "";
    this.auth.user.subscribe((user) => {
      this.walletForm = formBuilder.group({
        'firstName': [user.firstName || "", CustomValidators.nameValidator],
        'lastName': [user.lastName || "", CustomValidators.nameValidator],
        'secretPhrase': [ "", CustomValidators.secretPhraseValidator],
        'secretPhraseConfirmation': ["", Validators.required]
      }, {validator: CustomValidators.matchingSecretPhrases('secretPhrase', 'secretPhraseConfirmation')});
    });
  }

  suggestSecretPhrase() {
    var secureRandword = require('secure-randword');
    this.secretPhrase = secureRandword(5).join(' ');;
    this.walletForm.controls['secretPhrase'].markAsDirty();
  }

  submit() {
    let alert = Alert.create({
      title: 'IMPORTANT! Write down your passphrase',
      message: "Write this five word paraphrase down and store it someplace safe. UR Capital does not store your pass phrase and will NOT be able to recover it if it is lost or forgotten.",
      //" If you lose your passphrase, you will not be able to access your money ever again. ?',
      buttons: [
        {text: 'Cancel', handler: () => { alert.dismiss(); }},
        {text: 'OK', handler: () => {
          alert.dismiss().then(() => {
            this.confirmSecretPhraseWrittenDown();
          });
        }}
      ]
    });

    this.nav.present(alert);
  }

  confirmSecretPhraseWrittenDown() {
    let alert = Alert.create({
      title: "Confirm you wrote down your passphrase",
      message: "If you lose your passphrase, you will not be able to access your money ever again. Did you write down your passphrase?",
      buttons: [
        {text: 'No', handler: () => { alert.dismiss(); }},
        {text: 'Yes', handler: () => {
          alert.dismiss().then(() => {
            this.saveNamesAndPublicKey();
          });
        }}
      ]
    });
    this.nav.present(alert);
  }

  saveNamesAndPublicKey() {
    this.loadingModal.show();

    // TODO: Alex: Insert code here to generate public and private keys based on this.secretPhrase
    let publicKey = "0x8805317929d0a8cd1e7a19a4a2523b821ed05e42"; // using this dummy address for now

    this.auth.user.update({
      firstName: this.walletForm.value.firstName,
      lastName: this.walletForm.value.lastName,
      wallet: {
        publicKey: publicKey,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      }
    }).then(() => {
      this.loadingModal.hide();
      this.nav.setRoot(HomePage);
    });
  }

}
