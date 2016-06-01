import {Page, NavController, Alert} from 'ionic-angular';
import {Component} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, AbstractControl} from '@angular/common';
import {Auth} from '../../components/auth/auth';
import {Welcome3Page} from './welcome3';
import {CustomValidators} from '../../components/custom-validators/custom-validators';

@Page({
  templateUrl: 'build/pages/welcome/welcome2.html',
  directives: [FORM_DIRECTIVES]
})
export class Welcome2Page {
  phoneForm: ControlGroup;
  phoneControl: AbstractControl;

  constructor(
    public nav: NavController,
    public formBuilder: FormBuilder,
    public auth: Auth
  ) {
    this.phoneForm = formBuilder.group({
      'phone': ["", CustomValidators.phoneValidator]
    });
    this.phoneControl = this.phoneForm.controls['phone'];
  }

  normalizedPhone(phone) {
    return (phone || "").replace(/\D/g, "");
  }

  formattedPhone(phone) {
    var newPhone = this.normalizedPhone(phone);
    if (newPhone.length == 10) {
      newPhone = newPhone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    }
    return newPhone;
  }

  submit() {
    var phone = this.normalizedPhone(this.phoneForm.value.phone);
    let alert = Alert.create({
      title: 'NUMBER CONFIRMATION',
      message: "<p>" + this.formattedPhone(phone) + "</p><p>Is your phone number above correct?</p>",
      buttons: [
        {
          text: 'EDIT',
          role: 'cancel',
          handler: () => {
            // do nothing
          }
        },
        {
          text: 'YES',
          handler: () => {
            alert.dismiss();
            this.auth.sendVerificationSMS(phone).then( () => {
              this.nav.setRoot(Welcome3Page, {phone:phone});
            });
          }
        }
      ]
    });
    this.nav.present(alert);

  }

}
