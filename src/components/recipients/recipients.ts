import { Component, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Toast } from '@ionic-native/toast';
import { AuthService } from '../../services/auth';
import { App } from 'ionic-angular';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

import * as _ from 'lodash';

@Component({
  templateUrl: 'recipients.html',
  selector: 'recipients',
})
export class RecipientsComponent {

  @Output() onContactSelected: EventEmitter<any> = new EventEmitter();

  showSpinner: boolean = false;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    public app: App,
    private socialSharing: SocialSharing,
    private toast: Toast,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent('Select send UR recipients modal', 'Loaded', 'ionViewDidLoad()');
  }

  contactSelected(contact: any) {
    this.onContactSelected.emit({ contact: contact });
  }

  doSearch(event: any) {

    this.showSpinner = true;

    let searchText: string = _.trim(event.target.value || '');

    if (!searchText) {
      return;
    }

  }

  cancelSearch() {
    this.showSpinner = false;
  }
}
