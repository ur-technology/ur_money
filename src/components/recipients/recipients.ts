import { Component, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Toast } from '@ionic-native/toast';
import { AuthService } from '../../services/auth';
import { App } from 'ionic-angular';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';
import { UserService } from '../../services/user.service';

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
    private userService: UserService
  ) {
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent('Select send UR recipients modal', 'Loaded', 'ionViewDidLoad()');
  }

  recipientSelected(contact: any) {
    this.onContactSelected.emit({ contact: contact });
  }

  searchRecipients() {
    if(this.showSpinner) {
      return;
    }
    this.showSpinner = true;
    this.searchText = _.trim(this.searchText || '');

    this.userService.searchRecipients(this.auth.currentUser.key, this.searchText).then((results: any) => {
      if (results) {
        this.results = results.data;
      } else {
        this.results = [];
      }
      this.showSpinner = false;
    });
  }

}
