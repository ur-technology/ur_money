import {Page, NavController, NavParams} from 'ionic-angular';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators} from '@angular/common';
import {CustomValidators} from '../../components/custom-validators/custom-validators';
import {Auth} from '../../components/auth/auth';
import {LoadingModal} from '../../components/loading-modal/loading-modal';
import {HomePage} from '../home/home';
import {AngularFire} from 'angularfire2'

@Page({
  templateUrl: 'build/pages/registration/registration4.html',
  directives: [FORM_DIRECTIVES]
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
    this.auth.user.subscribe((user) => {
      this.walletForm = formBuilder.group({
        'firstName': [user.firstName || "", CustomValidators.nameValidator],
        'lastName': [user.lastName || "", CustomValidators.nameValidator],
        'secretPhrase': [ "", CustomValidators.secretPhraseValidator],
        'secretPhraseConfirmation': ["", Validators.required]
      }, {validator: CustomValidators.matchingSecretPhrases('secretPhrase', 'secretPhraseConfirmation')});
      var focusSet = false;
      if (_.isEmpty(user.firstName)) {
        let control = this.walletForm.controls['firstName'];
        control.markAsDirty();
        // control.setFocus();
        focusSet = true;
      }
      if (!_.isEmpty(user.lastName)) {
        let control = this.walletForm.controls['lastName'];
        control.markAsDirty();
        if (!focusSet) {
          // control.setFocus();
          focusSet = true;
        }
      }
      if (!focusSet) {
        let control = this.walletForm.controls['secretPhrase'];
        // control.setFocus();
        focusSet = true;
      }
      this.secretPhrase = "";
    });
  }

  suggestSecretPhrase() {
    var secureRandword = require('secure-randword');
    this.secretPhrase = secureRandword(5).join(' ');;
    this.walletForm.controls['secretPhrase'].markAsDirty();
  }

  submit() {
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
