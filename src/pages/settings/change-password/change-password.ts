import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {CustomValidator} from '../../../validators/custom';
import {HomePage} from '../../home/home';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html'
})
export class ChangePasswordPage {
  mainForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, private toastCtrl: ToastController, private translate: TranslateService) {
    this.mainForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]),
      passwordConfirmation: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)])
    }, CustomValidator.isMatchingPassword);
  }

  submit() {
    let toast = this.toastCtrl.create({ message: this.translate.instant('settings.passwordChanged'), duration: 3000, position: 'bottom' });
    toast.present();
    this.navCtrl.setRoot(HomePage);
  }


}
