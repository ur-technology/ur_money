import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LostPasswordPage } from '../lost-password/lost-password';

@Component({
  selector: 'page-sign-in-password',
  templateUrl: 'sign-in-password.html'
})
export class SignInPasswordPage {
  mainForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.mainForm = new FormGroup({ password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]) });
  }

  submit() {

  }

  lostPassword() {
    this.navCtrl.push(LostPasswordPage);
  }
}
