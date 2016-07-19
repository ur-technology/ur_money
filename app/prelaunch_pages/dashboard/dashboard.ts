import {Page, NavController, NavParams, Toast} from 'ionic-angular';
import {Component} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, AbstractControl} from '@angular/common';
import {Auth} from '../../components/auth/auth';
import {Focuser} from '../../components/focuser/focuser';
import {PrelaunchService} from '../../prelaunch_components/prelaunch-service/prelaunch-service';
import {CustomValidators} from '../../components/custom-validators/custom-validators';
import {AngularFire, FirebaseObjectObservable} from 'angularfire2';
import * as _ from 'lodash';

@Page({
  directives: [FORM_DIRECTIVES, Focuser],
  templateUrl: 'build/prelaunch_pages/dashboard/dashboard.html'
})
export class DashboardPage {
  inviteForm: ControlGroup;
  phoneControl: AbstractControl;
  user: any;
  allUsers: any;
  submissionInProgress: boolean;
  phone: AbstractControl;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public auth: Auth,
    public prelaunchService: PrelaunchService,
    public angularFire: AngularFire
  ) {
    this.buildForm()
    this.user = navParams.get("user");
    this.setAllUsers();
  }

  setAllUsers() {
    var thisPage = this;
    this.angularFire.database.list('/users').subscribe((idToUserMapping) => {
      var topUser = _.find(idToUserMapping, function(user,uid) { return !user["sponsor"]; });
      var numUsers = _.size(idToUserMapping);
      var i = 0;
      _.each(idToUserMapping, function(user, uid) {
        if (!user["children"])  {
          user["children"] = [];
        }
        if (user["sponsor"]) {
          var sponsor = idToUserMapping[user["sponsor"]["uid"]];
          if (!sponsor["children"])  {
            sponsor["children"] = [];
          }
          sponsor.children.push(user);
        }
        i++;
        if (i == numUsers) {
          thisPage.getUserAndDownline(topUser, function(orderedUsers) {
            thisPage.allUsers = orderedUsers;
          });
        }
      });
    });
  }

  getUserAndDownline(user, callback) {
    var orderedUsers = [user];
    if (user.children.length > 0) {
      var thisPage = this;
      _.each(user.children, function(child, index) {
        let i: number = parseInt(index);
        thisPage.getUserAndDownline(child, function(childAndDownline) {
          orderedUsers = orderedUsers.concat(childAndDownline);
          if (i == user.children.length - 1) {
            callback(orderedUsers);
          }
        });
      });
    } else {
      callback(orderedUsers);
    }
  }

  sendInvitation(event, phoneInput) {
    this.submissionInProgress = true;
    var invitedUser = {
      sponsor: {
        uid: this.user.uid,
        firstName: this.user.firstName,
        lastName: this.user.lastName
      },
      downlineLevel: this.user.downlineLevel + 1,
      phone: CustomValidators.normalizedPhone(this.inviteForm.value.phone),
      invitedAt: firebase.database.ServerValue.TIMESTAMP
    };
    this.prelaunchService.saveUser(invitedUser);
    this.buildForm();
    var options = {
      message: 'You invitation has been sent. Go ahead and send another one!',
      duration: 2000,
      position: 'top'
    };
    const toast = Toast.create(options);
    toast.onDismiss((toast: Toast) => {
      phoneInput.setFocus();
    });
    this.nav.present(toast);
    this.submissionInProgress = false;
  }

  buildForm() {
    this.inviteForm = this.formBuilder.group({
      'phone': ["", CustomValidators.phoneValidator],
    });
    this.phone = this.inviteForm.controls['phone'];
  }

  fullName(user) {
    return user && user.firstName && user.lastName ? user.firstName + " " + user.lastName : "Unknown";
  }
}
