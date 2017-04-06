import { NavController, Platform } from 'ionic-angular';
import { AuthService } from '../../services/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Utils } from '../../services/utils';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

declare var jQuery: any;

@Component({
  selector: 'invite-link',
  templateUrl: 'invite-link.html',
})
export class InviteLinkPage {
  mainForm: FormGroup;
  pageName = 'InviteLinkPage';

  constructor(public nav: NavController, public platform: Platform, public auth: AuthService, private translate: TranslateService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    let formElements: any = {
      referralLink: new FormControl(Utils.referralLink(this.auth.currentUser.referralCode), [Validators.required]),
      referralMessage: new FormControl(this.translate.instant('invite-link.messageText', { value: Utils.referralLink(this.auth.currentUser.referralCode) }), [Validators.required])
    };
    this.mainForm = new FormGroup(formElements);
  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
    let Clipboard = require('clipboard');
    new Clipboard('#copy-button');
  }

}
