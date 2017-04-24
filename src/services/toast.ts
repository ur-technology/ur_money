import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import * as _ from 'lodash';

@Injectable()
export class ToastService {
  toast: any;

  constructor(
    private toastController: ToastController
  ) {
  }

  showMessage(options): Promise<any> {
    let self = this;
    return self.dismissPreviousToast().then(() => {
      options = _.defaults(options, {
        message: options.message,
        duration: 5500,
        position: 'bottom'
      });
      self.toast = self.toastController.create(options);
      self.toast.present();

      return self.toast;
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
