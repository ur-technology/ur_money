import {Page, NavController, NavParams, Toast} from 'ionic-angular';
import {Component} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, AbstractControl} from '@angular/common';
import {Auth} from '../../components/auth/auth';
import {FirebaseService} from '../../prelaunch_components/firebase-service/firebase-service';
import {CustomValidators} from '../../components/custom-validators/custom-validators';
import * as _ from 'underscore'

@Page({
  templateUrl: 'build/prelaunch_pages/dashboard/dashboard.html',
  directives: [FORM_DIRECTIVES]
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
    public firebaseService: FirebaseService
  ) {
    this.buildForm()
    this.user = navParams.get("user");
    this.setAllUsers();
  }

  setAllUsers() {
    var thisPage = this;
    this.auth.firebaseRef().child("users").once("value", function(snapshot) {
      var idToUserMapping = snapshot.val();
      var topUser = _.detect(idToUserMapping, function(user,uid) { return !user["sponsor"]; });
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
      _.each(user.children, function(child, i) {
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
      phone: "+1" + this.inviteForm.value.phone.replace(/\D/g,''),
      invitedAt: Firebase.ServerValue.TIMESTAMP
    };
    this.firebaseService.saveUser(invitedUser);
    this.buildForm();
    phoneInput.setFocus();
    var options = {
      message: 'You invitation has been sent. Go ahead and send another one!',
      duration: 2000,
      position: 'top'
    };
    const toast = Toast.create(options);
    toast.onDismiss(function(toast: Toast) {
      console.info('Toast onDismiss()');
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
