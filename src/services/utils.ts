import { Config } from '../config/config';
import * as _ from 'lodash';

export class Utils {

  static envModeDisplay() {
    let matches = Config.firebaseProjectId.match(/ur-money-(\w+)/);
    let mode =  (matches && matches[1]) || 'unknown';
    return mode === 'production' ? '' : `${_.startCase(mode)} mode`;
  }

  static referralLink(referralCode): string {
    return `https://${Config.deeplinkHost}/r/${referralCode}`;
  }

  static normalizedPhone(telephoneCountryCode, phone, mobileAreaCodePrefix): string {
    let strippedPhone: string = (phone || '').replace(/\D/g, '');
    let extraPrefix: string = mobileAreaCodePrefix || '';
    if (extraPrefix && strippedPhone.startsWith(extraPrefix)) {
      extraPrefix = '';
    }
    return telephoneCountryCode + extraPrefix + strippedPhone;
  }

  static queryParams(): any {
    let qs = window.location.search.split('+').join(' ');

    var params = {},
      tokens,
      re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
  }
}
