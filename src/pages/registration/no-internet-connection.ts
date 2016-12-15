import {TranslateService} from 'ng2-translate/ng2-translate';
import { Component } from '@angular/core';

@Component({
  templateUrl: 'no-internet-connection.html',
})
export class NoInternetConnectionPage {

  constructor(
    public translate: TranslateService
  ) {
  }

  reload() {
    window.location.reload();
  }
}
