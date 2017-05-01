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
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  mainForm: FormGroup;

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

    this.mainForm = new FormGroup({
      sendTo: new FormControl('', (control) => {
        return Validators.required(control) || this.validateRecipientSendTo(this.auth.currentUser.countryCode, control);
      }),
    });
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
    if (!this.mainForm.valid) {
      return;
    }
    this.showSpinner = true;

    this.userService.searchRecipientsWallets(this.auth.currentUser.key, this.searchText).then((results: any) => {
      results ? this.results = results.data : this.results = [];
      this.showSpinner = false;
    });
  }

  validateRecipientSendTo(countryCode, control) {
    let self = this;
    if (control.value) {
      let trimmedText = _.trim(control.value || '');
      if (Utils.validateEmail(trimmedText)) {
        return;
      } else {
        let res = Utils.validateAndParsePhoneNumber(trimmedText, countryCode);
        if (res.valid) {
          self.searchText = res.parsedNumber;
          return;
        }
      }
      return { 'invalidSendTo': true };
    }
  }

  country(code) {
    let country = this.countryListService.findCountryByCode(code);
    if (country !== 'None') {
      return country;
    }
  }

}
