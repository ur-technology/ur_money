import { NavParams, ViewController, ToastController } from 'ionic-angular';
import { Component } from '@angular/core';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';
import * as _ from 'lodash';
import * as log from 'loglevel';

@Component({
  templateUrl: 'change-sponsor.html'
})
export class ChangeSponsorModal {
  newSponsorEmail: string;
  oldSponsor: any;
  user: any;
  errorMessage: string;
  showSpinner: boolean = false;
  pageName = 'ChangeSponsorModal';

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.user = this.navParams.get('user');
    this.oldSponsor = this.navParams.get('oldSponsor');
    this.newSponsorEmail = '';
    this.errorMessage = '';
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  cancel(event) {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Click on cancel', 'cancel()');
    event.stopPropagation();
    this.viewCtrl.dismiss(undefined);
  }

  saveChange(event) {
    event.stopPropagation();
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Click on save button', 'saveChange()');
    this.errorMessage = '';
    this.newSponsorEmail = _.trim(this.newSponsorEmail);
    if (!this.newSponsorEmail) {
      this.errorMessage = 'Sponsor email must not be blank.';
      return;
    }

    this.showSpinner = true;
    let downlineSizeChange = (this.user.downlineSize || 0) + 1;
    let newSponsor: any;
    firebase.database().ref(`/users`).orderByChild('email').equalTo(this.newSponsorEmail).once('value').then((snapshot) => {
      let matchingUsers = snapshot.val();
      if (!matchingUsers) {
        this.errorMessage = 'No sponsor found with that email. Please try again.';
        return Promise.reject('no sponsor found');
      }
      newSponsor = _.first(_.values(matchingUsers));
      newSponsor.userId = _.first(_.keys(matchingUsers));
      this.user.sponsor = _.pick(newSponsor, ['name', 'profilePhotoUrl', 'userId']);
      this.user.sponsor = _.merge(this.user.sponsor, {
        announcementTransactionConfirmed: !!newSponsor.wallet &&
        !!newSponsor.wallet.announcementTransaction &&
        !!newSponsor.wallet.announcementTransaction.blockNumber &&
        !!newSponsor.wallet.announcementTransaction.hash
      });
      this.user.sponsor = _.omit(this.user.sponsor, _.isNil);
      this.user.downlineLevel = (newSponsor.downlineLevel || 0) + 1;
      return firebase.database().ref(`/users/${this.user.userId}`).update({
        downlineLevel: this.user.downlineLevel,
        sponsor: this.user.sponsor
      });
    }).then(() => {
      let newDownlineSize = Math.max(0, (this.oldSponsor.downlineSize || 0) - downlineSizeChange);
      return firebase.database().ref(`/users/${this.oldSponsor.userId}/downlineSize`).set(newDownlineSize);
    }).then((snapshot) => {
      let newDownlineSize = Math.max(0, (newSponsor.downlineSize || 0) + downlineSizeChange);
      return firebase.database().ref(`/users/${newSponsor.userId}/downlineSize`).set(newDownlineSize);
    }).then(() => {
      this.toastCtrl.create({ message: 'Sponsor has been changed.' }).present().then(() => {
        this.viewCtrl.dismiss(newSponsor);
      });
    }, (error) => {
      this.showSpinner = false;
      if (this.errorMessage) {
        log.debug(error);
      } else {
        this.errorMessage = 'Internal error. Please try again later.';
        log.warn(error);
      }
    });
  }
}
