import {NavController, NavParams, ToastController, AlertController} from 'ionic-angular';
import {Inject, Component} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {AuthService} from '../../services/auth';
import {UserModel} from '../../models/user';
import * as _ from 'lodash';
import { FirebaseApp } from 'angularfire2';
import * as log from 'loglevel';

declare var window: any;
declare var jQuery: any;

@Component({
  templateUrl: 'user.html'
})
export class UserPage {
  mainForm: FormGroup;
  errorMessage: string;
  countries: any[];
  user: any;
  inEditMode: boolean = true;
  showSpinner: boolean = false;
  referrals: any[];

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    @Inject(FirebaseApp) firebase: any
  ) {

    this.mainForm = new FormGroup({
      sponsorName: new FormControl({value: '', disabled: true}),
      name: new FormControl({value: '', disabled: true}),
      country: new FormControl({value: '', disabled: true}),
      email: new FormControl({value: '', disabled: true}),
      phone: new FormControl({value: '', disabled: true}),
      downlineSize: new FormControl({value: '', disabled: true}),
      ipAddress: new FormControl({value: '', disabled: true})
    });

    this.user = this.navParams.get('user');
    this.user.phone = this.user.phone || 'None';
    this.user.email = this.user.email || 'None';
    this.user.disabled = !!this.user.disabled;
    this.user.fraudSuspected = !!this.user.fraudSuspected;
    this.user.duplicate = !!this.user.duplicate;

    this.countries = require('country-data').countries.all;
    this.user.country = this.country(this.user);
    this.user.ipAddress = (this.user.prefineryUser && this.user.prefineryUser.ipAddress) || 'None';

    this.showSpinner = true;
    let referralsRef: any = firebase.database().ref('/users').orderByChild('sponsor/userId').equalTo(this.user.userId);
    referralsRef.once('value').then((snapshot) => {
      let referralsMapping: any = snapshot.val() || {};
      this.referrals = _.values(referralsMapping);
      let referralUserIds = _.keys(referralsMapping);
      _.each(this.referrals, (r: any, index: number) => {
        r.userId = referralUserIds[index];
      });
      this.showSpinner = false;
    }, (error) => {
      log.warn(error);
      this.showSpinner = false;
    });
  }

  saveProfile() {
    let attrs: any = _.pick(this.user, ['firstName', 'middleName', 'lastName', 'countryCode']);
    let name = UserModel.fullName(this.user);
    if (name) {
      attrs.name = name;
    }
    this.auth.currentUserRef.update(attrs).then(() => {
      this.auth.reloadCurrentUser();
      let toast = this.toastCtrl.create({ message: 'User info has been updated.', duration: 3000, position: 'bottom' });
      toast.present();
    }).catch((error) => {
      log.warn('unable to save profile');
    });
  }

  goToUserPage(u: any) {
    this.nav.push(UserPage, { user: u }, { animate: true, direction: 'forward' });
  }

  goToSponsorPage() {
    firebase.database().ref(`/users/${this.user.sponsor.userId}`).once('value').then((snapshot) => {
      this.showSpinner = false;
      let sponsor = snapshot.val();
      if (!sponsor) {
        log.warn('could not find sponsor');
        return;
      }
      sponsor.userId = this.user.sponsor.userId;
      this.nav.push(UserPage, { user: sponsor }, { animate: true, direction: 'forward' });
    }, (error) => {
      this.showSpinner = false;
      log.warn(error);
    });


  }

  country(u) {
    let countryObject = this.countries.find((x) => { return x.alpha2 === (u.countryCode); });
    return ( countryObject && countryObject.name ) || ( u.prefineryUser && u.prefineryUser.country ) || 'None';
  }

  foo() {
    log.debug(`updated`);
  }

  toggle(fieldName) {
    let attrs: any = {};
    attrs[fieldName] = !this.user[fieldName];
    firebase.database().ref(`/users/${this.user.userId}`).update(attrs).then(() => {
      this.user[fieldName] = !this.user[fieldName];
      log.debug(`updated: `, attrs);
    }, (error) => {
      this.showSpinner = false;
      log.warn(error);
    });
  }

  changeSponsor(event) {
    alert('Not implemented yet');
    event.stopPropagation();
  }
}
