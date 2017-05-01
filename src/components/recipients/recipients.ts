import { Component, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Toast } from '@ionic-native/toast';
import { AuthService } from '../../services/auth';
import { App } from 'ionic-angular';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';
import { UserService } from '../../services/user.service';
import { CountryListService } from '../../services/country-list';
import { Utils } from '../../services/utils';

import * as _ from 'lodash';

@Component({
  templateUrl: 'recipients.html',
  selector: 'recipients',
})
export class RecipientsComponent {

  @Output() onContactSelected: EventEmitter<any> = new EventEmitter();

  showSpinner: boolean = false;
  searchText: string;
  results;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    public app: App,
    private socialSharing: SocialSharing,
    private toast: Toast,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService,
    private userService: UserService,
    private countryListService: CountryListService
  ) {
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent('Select send UR recipients modal', 'Loaded', 'ionViewDidLoad()');
  }

  recipientSelected(contact: any) {
    this.onContactSelected.emit({ contact: contact });
  }

  searchRecipients() {
    if (this.showSpinner) {
      return;
    }
    if (!this.validateSearchText()) {
      this.results = [];
      return;
    }
    this.showSpinner = true;

    this.userService.searchRecipientsWallets(this.auth.currentUser.key, this.searchText).then((results: any) => {
      results ? this.results = results.data : this.results = [];
      this.showSpinner = false;
    });
  }

  private validateSearchText(): boolean {
    let trimmedText = _.trim(this.searchText || '');
    if (Utils.validateEmail(trimmedText)) {
      return true;
    } else {
      let res = Utils.validateAndParsePhoneNumber(trimmedText, this.auth.currentUser.countryCode);
      if (res.valid) {
        this.searchText = res.parsedNumber;
        return true;
      }
    }
    return false;
  }

  country(code) {
    let country = this.countryListService.findCountryByCode(code);
    if (country !== 'None') {
      return country;
    }
  }

}
