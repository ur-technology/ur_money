// import {Dialogs} from 'ionic-native';
// import {Loading} from 'ionic-angular';
// import {Component} from '@angular/core';
// import {FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl, Control} from '@angular/common';
// import {Auth} from '../../components/auth/auth';
// import {Welcome3Page} from './welcome3';
// import {CustomValidators} from '../../components/custom-validators/custom-validators';
// import {AngularFire} from 'angularfire2'
// import * as Firebase from 'firebase';
// import * as _ from 'underscore';
//
// @Page({
//   templateUrl: 'build/pages/welcome/welcome2.html',
//   directives: [FORM_DIRECTIVES]
// })
// export class Welcome2Page {
//   phoneForm: ControlGroup;
//   phoneControl: AbstractControl;
//   loading: any;
//
//   constructor(
//     public nav: NavController,
//     public formBuilder: FormBuilder,
//     public auth: Auth,
//     public angularFire: AngularFire
//   ) {
//     this.phoneForm = formBuilder.group({
//       'phone': ["", CustomValidators.phoneValidator]
//      });
//      this.phoneControl = this.phoneForm.controls['phone'];
//   }
//
//   submitPhone() {
//     var phone = this.phoneForm.value.phone;
//     this.angularFire.database.list( "/phone_verifications" ).push({
//       phone: phone,
//       createdAt: Firebase.ServerValue.TIMESTAMP
//     }).then( () => {
//       this.showLoader();
//
//     });
//
//     Dialogs.confirm(
//       "Would you like to be notified of messages from friends and changes to your balance?",
//       "UR Navigator would like to send you notifications",
//       [ "OK", "Not Now" ]
//     ).then( (allowNotificationsButtonIndex) => {
//       Dialogs.confirm(
//         "Having access to your contacts makes it easier to earn rewards for signing up friends. Allow access to contacts?",
//         "UR Navigator would like to access your contacts",
//         [ "OK", "Not Now" ]
//       ).then( (allowContactsButtonIndex) => {
//         this.auth.sendVerificationSMS(
//           phone,
//           allowNotificationsButtonIndex == 0,
//           allowContactsButtonIndex == 0
//         ).then(() => {
//           alert('ready');
//         });
//       });
//     });
//
//   showLoader() {
//     this.loading = Loading.create({
//       content: "Please wait...",
//       duration: 3000
//     });
//     this.nav.present(loading);
//   }
//
// }
