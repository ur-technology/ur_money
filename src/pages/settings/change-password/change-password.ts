import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {CustomValidator} from '../../../validators/custom';

@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html'
})
export class ChangePasswordPage {
  mainForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.mainForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required]),
      verifyPassword: new FormControl('', [Validators.required])
    }, CustomValidator.isMatchingPassword);
  }

  submit() {

  }


}
