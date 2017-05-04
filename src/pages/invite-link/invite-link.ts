import { NavController, Platform } from 'ionic-angular';
import { AuthService } from '../../services/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Utils } from '../../services/utils';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

declare var jQuery: any;

@Component({
  selector: 'invite-link',
  templateUrl: 'invite-link.html',
})
export class InviteLinkPage {
  mainForm: FormGroup;
  pageName = 'InviteLinkPage';

  constructor(public nav: NavController, public platform: Platform, public auth: AuthService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    let formElements: any = {
      referralLink: new FormControl(Utils.referralLink(this.auth.currentUser.referralCode), [Validators.required]),
      referralMessage: new FormControl(`Hi, I am using UR Money and got some bonus UR!! You can get some UR too after you sign up. Here is my invite ${Utils.referralLink(this.auth.currentUser.referralCode)}`, [Validators.required])
    };
    this.mainForm = new FormGroup(formElements);
  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
    let Clipboard = require('clipboard');
    new Clipboard('#copy-button');
  }

}
