import { NavController, Platform } from 'ionic-angular';
import { AuthService } from '../../services/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Utils } from '../../services/utils';

declare var jQuery: any;

@Component({
  selector: 'invite-link',
  templateUrl: 'invite-link.html',
})
export class InviteLinkPage {
  mainForm: FormGroup;

  constructor(public nav: NavController, public platform: Platform, public auth: AuthService) {
    let formElements: any = {
      referralLink: new FormControl(Utils.referralLink(this.auth.currentUser.referralCode), [Validators.required])
    };
    this.mainForm = new FormGroup(formElements);
  }

  ionViewDidEnter() {
    let Clipboard = require('clipboard');
    new Clipboard('#copy-button');
  }

}
