import {Page, NavController, Platform} from 'ionic-angular';
import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../services/auth';
import { FormGroup, FormControl, Validators} from '@angular/forms';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/invite-link/invite-link.html',
  pipes: [TranslatePipe]
})
export class InviteLinkPage {
  public versionNumber: string;
  mainForm: FormGroup;
  referralLink: string;

  constructor(public nav: NavController, private platform: Platform, private auth: AuthService, private translateService: TranslateService) {
    this.referralLink = this.auth.referralLink(window);
    let formElements: any = {
      referralLink: new FormControl('', [Validators.required])
    };
    this.mainForm = new FormGroup(formElements);
  }

  onPageDidEnter() {
    let Clipboard = require('clipboard');
    new Clipboard('#copy-button');
  }

}
