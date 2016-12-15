import {Page} from 'ionic-angular';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';

@Page({
  templateUrl: 'build/pages/registration/no-internet-connection.html',
  pipes: [TranslatePipe]
})
export class NoInternetConnectionPage {

  constructor(
    private translate: TranslateService
  ) {
  }

  reload() {
    window.location.reload();
  }
}
