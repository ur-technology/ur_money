import { NavController, Platform } from 'ionic-angular';
import { AuthService } from '../../services/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component } from '@angular/core';

declare var jQuery: any;

@Component({
  selector: 'invite-link',
  templateUrl: 'invite-link.html',
})
export class InviteLinkPage {
  public versionNumber: string;
  mainForm: FormGroup;

  constructor(public nav: NavController, public platform: Platform, public auth: AuthService) {
    let formElements: any = {
      referralLink: new FormControl(this.auth.referralLink(window), [Validators.required])
    };
    this.mainForm = new FormGroup(formElements);
  }

  ionViewDidEnter() {
    let Clipboard = require('clipboard');
    new Clipboard('#copy-button');
  }

}
