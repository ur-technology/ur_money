import {NavController, NavParams, ToastController, AlertController, ModalController} from 'ionic-angular';
import {Component} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth';
import {CustomValidator} from '../../validators/custom';
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
  db: any;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {

    this.mainForm = new FormGroup({
      firstName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      middleName: new FormControl('', [CustomValidator.nameValidator]),
      lastName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      name: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      countryCode: new FormControl('', Validators.required),
      phone: new FormControl('', [Validators.required, CustomValidator.phoneValidator]),
      email: new FormControl('', [CustomValidator.emailValidator]),
      downlineSize: new FormControl({value: '', disabled: true}),
      ipAddress: new FormControl({value: '', disabled: true}),
      sponsorName: new FormControl({value: '', disabled: true}),
      sponsorContact: new FormControl({value: '', disabled: true})
    });

    this.user = this.navParams.get('user');
    this.user.firstName = this.user.firstName || '';
    this.user.middleName = this.user.middleName || '';
    this.user.lastName = this.user.lastName || '';
    this.user.name = this.user.name || UserModel.fullName(this.user);
    this.user.phone = this.user.phone || '';
    this.user.email = this.user.email || '';
    this.user.countryCode = this.user.countryCode || 'US';
    this.fillCountriesArray();

    this.user.moveRequested = !!this.user.moveRequested;
    this.user.disabled = !!this.user.disabled;
    this.user.fraudSuspected = !!this.user.fraudSuspected;
    this.user.duplicate = !!this.user.duplicate;
    this.user.status = this.getUserStatus(this.user);

    this.user.ipAddress = (this.user.prefineryUser && this.user.prefineryUser.ipAddress) || 'None';

    this.showSpinner = true;
    this.db = firebase.database();
    let referralsRef: any = this.db.ref('/users').orderByChild('sponsor/userId').equalTo(this.user.userId);
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
      this.db.ref(`/users/${this.user.sponsor.userId}`).once('value').then((snapshot) => {
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

  onCountrySelected(countrySelected) {
    this.user.countryCode = countrySelected.alpha2;
  }

  private fillCountriesArray() {
    this.countries = require('country-data').countries.all.sort((a, b) => {
      return (a.name < b.name) ? -1 : ((a.name === b.name) ? 0 : 1);
    });
    // remove Cuba, Iran, North Korea, Sudan, Syria
    this.countries = _.filter(this.countries, (country) => {
      return ['CU', 'IR', 'KP', 'SD', 'SY'].indexOf(country.alpha2) === -1;
    });
    this.countries = _.filter(this.countries, { status: 'assigned' });
    let country = this.countries.find((x) => { return x.alpha2 === (this.user.countryCode || 'US'); });
    (<FormControl>this.mainForm.controls['countryCode']).setValue(country);
  }

  goToUserPage(u: any) {
    this.nav.push(UserPage, { user: u });
  }

  country(u) {
    let countryObject = this.countries.find((x) => { return x.alpha2 === (u.countryCode); });
    return ( countryObject && countryObject.name ) || ( u.prefineryUser && u.prefineryUser.country ) || 'None';
  }

  toggle(fieldName) {
    let attrs: any = {};
    this.user[fieldName] = !this.user[fieldName];
    attrs[fieldName] = this.user[fieldName];
    this.db.ref(`/users/${this.user.userId}`).update(attrs).then(() => {
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

  saveProfile() {
    let attrs: any = _.pick(this.user, ['firstName', 'middleName', 'lastName', 'countryCode', 'phone', 'email']);
    _.each(attrs, (value, attr) => { attrs[attr] = _.trim(value || ''); });
    this.auth.currentUserRef.update(attrs).then(() => {
      this.auth.reloadCurrentUser();
      this.toastCtrl.create({
        message: 'User info has been updated.', duration: 4000, position: 'bottom'
      }).present();
    }).catch((error) => {
      log.warn('unable to save profile');
    });
  }


}
