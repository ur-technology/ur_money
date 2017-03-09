import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import {AuthService} from '../../../services/auth';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {CustomValidator} from '../../../validators/custom';
import {HomePage} from '../../home/home';
import {ToastService} from '../../../services/toast';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  selector: 'page-change-email',
  templateUrl: 'change-email.html'
})
export class ChangeEmailPage {

  mainForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthService, private toastService: ToastService, private loadingController: LoadingController, private translate: TranslateService) {
    this.mainForm = new FormGroup({
      email: new FormControl('', [Validators.required, CustomValidator.emailValidator])
    });
  }

  submit() {
    let loading = this.loadingController.create({content: this.translate.instant('pleaseWait')});
    loading.present();

    this.auth.currentUser.update({ email: this.mainForm.value.email }).then(data => {
      loading.dismiss();
      this.toastService.showMessage({ messageKey: 'settings.emailUpdated' });      
      this.navCtrl.setRoot(HomePage);
    })
  }


}
