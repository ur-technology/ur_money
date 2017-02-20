import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {CustomValidator} from '../../../validators/custom';
import {HomePage} from '../../home/home';
import { TranslateService } from 'ng2-translate/ng2-translate';
import {ToastService} from '../../../services/toast';

@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html'
})
export class ChangePasswordPage {
  mainForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, private toastService: ToastService, private translate: TranslateService, private loadingController: LoadingController) {
    this.mainForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]),
      passwordConfirmation: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)])
    }, CustomValidator.isMatchingPassword);
  }

  submit() {
    let loading = this.loadingController.create({content: this.translate.instant('pleaseWait')});
    loading.present();

    loading.dismiss();
    this.toastService.showMessage({ messageKey: 'settings.passwordChanged' });
    this.navCtrl.setRoot(HomePage);
  }


}
