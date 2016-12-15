import { NavController, Platform} from 'ionic-angular';
import {AuthService} from '../../services/auth';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Component } from '@angular/core';

declare var jQuery: any;

@Component({
  templateUrl: 'invite-link.html',
})
export class InviteLinkPage {
  public versionNumber: string;
  mainForm: FormGroup;
  referralLink: string;

  constructor(public nav: NavController, public platform: Platform, public auth: AuthService) {
    this.referralLink = this.auth.referralLink(window);
    let formElements: any = {
      referralLink: new FormControl('', [Validators.required])
    };
    this.mainForm = new FormGroup(formElements);
  }

  ionViewDidEnter() {
    let Clipboard = require('clipboard');
    new Clipboard('#copy-button');
  }

}
