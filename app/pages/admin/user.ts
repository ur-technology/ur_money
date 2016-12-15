import {Page, NavController, NavParams, ToastController, AlertController} from 'ionic-angular';
import {FormGroup, FormControl} from '@angular/forms';
import {AuthService} from '../../services/auth';
import {CustomValidator} from '../../validators/custom';
import {UserModel} from '../../models/user';
// import {Config} from '../../config/config';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';

declare var window: any;
declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/admin/user.html'
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
    private toastCtrl: ToastController
  ) {
  }

  ionViewLoaded() {
    this.countries = require('country-data').countries.all.sort((a, b) => {
      return (a.name < b.name) ? -1 : ((a.name === b.name) ? 0 : 1);
    });
    // remove Cuba, Iran, North Korea, Sudan, Syria
    this.countries = _.filter(this.countries, (country) => {
      return ['CU', 'IR', 'KP', 'SD', 'SY'].indexOf(country.alpha2) === -1;
    });

    this.mainForm = new FormGroup({
      firstName: new FormControl('', CustomValidator.nameValidator),
      middleName: new FormControl('', CustomValidator.optionalNameValidator),
      lastName: new FormControl('', CustomValidator.nameValidator),
      email: new FormControl('', CustomValidator.nameValidator),
      phone: new FormControl('', CustomValidator.nameValidator),
      downlineLevel: new FormControl('')
    });
    this.user = this.navParams.get('user');
    this.user.country = this.countries.find((x) => { return x.alpha2 === (this.user.countryCode || 'US'); });
    this.user.countryCode = this.user.country.alpha2;

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

}
