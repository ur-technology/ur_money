import {Injectable} from '@angular/core';
import {ToastController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';
import * as _ from 'lodash';

@Injectable()
export class ToastService {
  toast: any;

  constructor(
    private toastController: ToastController,
    private translate: TranslateService
  ) {
  }

  showMessage(options) {
    let self = this;
    self.dismissPreviousToast().then(() => {
      if (!options.message && options.messageKey) {
        options.message = self.translate.instant(options.messageKey);
      }
      options = _.defaults(options, {
        message: self.translate.instant(options.messageKey || 'unexpectedError'),
        duration: 3000,
        position: 'bottom'
      });
      this.toast = self.toastController.create(options);
      this.toast.present();
    });
  }

  dismissPreviousToast(): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      if (self.toast) {
        self.toast.dismiss().then(() => {
          this.toast = undefined;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
