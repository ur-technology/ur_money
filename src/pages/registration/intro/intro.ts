import { NavController, AlertController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {HomePage} from '../../home/home';
import { Component } from '@angular/core';
import {Config} from '../../../config/config';
import {ContactsService} from '../../../services/contacts';
import {AuthService} from '../../../services/auth';

@Component({
  selector: 'intro-page',
  templateUrl: 'intro.html',
})
export class IntroPage {
  configPlatform: string;

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    public contactsService: ContactsService,
    public auth: AuthService
  ) {
    this.configPlatform = Config.targetPlatform;
  }

  pleaseContinue() {
    this.auth.reloadCurrentUser().then(()=>{
      this.contactsService.loadContacts(this.auth.currentUserId, this.auth.currentUser.phone, this.auth.currentUser.countryCode);
      this.nav.setRoot(HomePage);
    });

  }
}
