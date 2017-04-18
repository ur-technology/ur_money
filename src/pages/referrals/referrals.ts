import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';
import * as _ from 'lodash';
import * as firebase from 'firebase';

@Component({
  selector: 'page-referrals',
  templateUrl: 'referrals.html',
})
export class ReferralsPage {
  pageName = 'ReferralsPage';
  referrals = [];
  showSpinner = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private userService: UserService, private auth: AuthService, private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReferralsPage');
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
    this.loadReferrals();
  }

  loadReferrals() {
    let self = this;
    self.showSpinner = true;
    let t1 = new Date();
    console.log(new Date());
    // this.userService.getReferrals(this.auth.currentUser.key).then(referrals => {
    self.userService.getReferrals('-KWUqyvjufVMXRXc12FL-3').then((referrals: any) => {
      // console.log('reserrals', referrals);
      // console.log('_.values(obj)', _.values(referrals));
      self.referrals = _.values(referrals);
      console.log('self.referrals', self.referrals);
      let t2 = new Date();
      var dif = t1.getTime() - t2.getTime();
      var Seconds_from_T1_to_T2 = dif / 1000;
      var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
      console.log('Seconds_Between_Dates', Seconds_Between_Dates);
      self.showSpinner = false;
      console.log(new Date());
    })
  }

}
