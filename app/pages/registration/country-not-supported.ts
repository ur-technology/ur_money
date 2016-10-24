import {Page, NavController} from 'ionic-angular';
import {AuthService} from '../../services/auth';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

@Page({
  templateUrl: 'build/pages/registration/country-not-supported.html',
  pipes: [TranslatePipe]
})
export class CountryNotSupportedPage {
  constructor(
    public nav: NavController,
    public auth: AuthService
  ) {
  }

}
