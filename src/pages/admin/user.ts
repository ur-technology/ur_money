import {NavController, NavParams, ToastController, AlertController, ModalController} from 'ionic-angular';
import {Component} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {AuthService} from '../../services/auth';
import {UserModel} from '../../models/user';
import {ChangeSponsorModal} from './change-sponsor';
import * as _ from 'lodash';
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
  sponsor: any;
  inEditMode: boolean = true;
  showSpinner: boolean = false;
  referrals: any[];


  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {

    this.mainForm = new FormGroup({
      name: new FormControl({value: '', disabled: true}),
      country: new FormControl({value: '', disabled: true}),
      email: new FormControl({value: '', disabled: true}),
      phone: new FormControl({value: '', disabled: true}),
      downlineSize: new FormControl({value: '', disabled: true}),
      ipAddress: new FormControl({value: '', disabled: true}),
      sponsorName: new FormControl({value: '', disabled: true}),
      sponsorContact: new FormControl({value: '', disabled: true})
    });

    this.user = this.navParams.get('user');
    this.user.phone = this.user.phone || 'None';
    this.user.email = this.user.email || 'None';
    this.user.moveRequested = !!this.user.moveRequested;
    this.user.disabled = !!this.user.disabled;
    this.user.fraudSuspected = !!this.user.fraudSuspected;
    this.user.duplicate = !!this.user.duplicate;
    this.user.status = this.getUserStatus(this.user);

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
        r.moveRequestedTag = r.moveRequested ? 'Move-Requested' : '';
        r.disabledTag = r.disabled ? 'Disabled' : '';
        r.fraudSuspectedTag = r.fraudSuspected ? 'Fraud-Suspected' : '';
        r.duplicateTag = r.duplicate ? 'Duplicate' : '';
      });
      this.referrals = _.sortBy(this.referrals, (r) => { return 1000000 - (r.downlineSize || 0);});
      this.showSpinner = false;
    }, (error) => {
      log.warn(error);
      this.showSpinner = false;
    });

    if (this.user.sponsor && this.user.sponsor.userId) {
      this.showSpinner = true;
      firebase.database().ref(`/users/${this.user.sponsor.userId}`).once('value').then((snapshot) => {
        this.sponsor = snapshot.val();
        if (this.sponsor) {
          this.sponsor.userId = this.user.sponsor.userId;
          this.sponsor.contact = _.compact([this.sponsor.email, this.sponsor.phone]).join(', ');
        }
        this.showSpinner = false;
      }, (error) => {
        this.showSpinner = false;
        log.warn(error);
      });
    }
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

  country(u) {
    let countryObject = this.countries.find((x) => { return x.alpha2 === (u.countryCode); });
    return ( countryObject && countryObject.name ) || ( u.prefineryUser && u.prefineryUser.country ) || 'None';
  }

  toggle(fieldName) {
    let attrs: any = {};
    this.user[fieldName] = !this.user[fieldName];
    attrs[fieldName] = this.user[fieldName];
    firebase.database().ref(`/users/${this.user.userId}`).update(attrs).then(() => {
      log.debug(`updated: `, attrs);
    }, (error) => {
      this.showSpinner = false;
      log.warn(error);
    });
  }

  changeSponsor(event) {
    let changeSponsorModal = this.modalCtrl.create(ChangeSponsorModal, {user: this.user, oldSponsor: this.sponsor});
    changeSponsorModal.present();
    event.stopPropagation();
    changeSponsorModal.onDidDismiss((newSponsor: any) => {
      if (newSponsor) {
        this.sponsor = newSponsor;
      }
    });
  }

  getUserStatus(user) {
    let status = _.trim((user.registration && user.registration.status) || '') || 'initial';
    if (status === 'initial' && user.wallet && user.wallet.address) {
      status = 'wallet-generated';
    } else if (status !== 'initial' && user.sponsor && !user.sponsor.announcementTransactionConfirmed) {
      status = 'waiting-for-sponsor';
    }
    return status;
  }

  sponsorChangeable() {
    return _.includes(
      [
        'initial', 'wallet-generated', 'waiting-for-sponsor', 'verification-initiated',
        'verification-failed', 'verification-succeeded', 'announcement-failed'
      ],
      this.getUserStatus(this.user)
    );
  }
}
