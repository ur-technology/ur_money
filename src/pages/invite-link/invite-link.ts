import { NavController, Platform } from 'ionic-angular';
import { AuthService } from '../../services/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Utils } from '../../services/utils';
import { TranslateService } from 'ng2-translate/ng2-translate';

declare var jQuery: any;

@Component({
  selector: 'invite-link',
  templateUrl: 'invite-link.html',
})
export class InviteLinkPage {
  mainForm: FormGroup;

  constructor(public nav: NavController, public platform: Platform, public auth: AuthService, private translate: TranslateService, ) {
    let formElements: any = {
      referralLink: new FormControl(Utils.referralLink(this.auth.currentUser.referralCode), [Validators.required]),
      referralMessage: new FormControl(this.translate.instant('invite-link.messageText', { value: Utils.referralLink(this.auth.currentUser.referralCode) }), [Validators.required])
    };
    this.mainForm = new FormGroup(formElements);
  }

  ionViewDidEnter() {
    let Clipboard = require('clipboard');
    new Clipboard('#copy-button');
  }

}
