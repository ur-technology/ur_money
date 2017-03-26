import { Config } from '../config/config';
import * as _ from 'lodash';

export class Utils {

  static envModeDisplay() {
    let matches = Config.firebaseProjectId.match(/ur-money-(\w+)/);
    let mode = (matches && matches[1]) || 'unknown';
    return mode === 'production' ? '' : `${_.startCase(mode)} mode`;
  }

  static referralLink(referralCode): string {
    return `https://${Config.deeplinkHost}?r=${referralCode}`;
  }

  static normalizedPhone(telephoneCountryCode, phone, mobileAreaCodePrefix): string {
    let strippedPhone: string = (phone || '').replace(/\D/g, '');
    let extraPrefix: string = mobileAreaCodePrefix || '';
    if (extraPrefix && strippedPhone.startsWith(extraPrefix)) {
      extraPrefix = '';
    }
    return telephoneCountryCode + extraPrefix + strippedPhone;
  }

  static getUrlParamByName(name: string, url: string = ''): string {
    url = url || window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const results = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`).exec(url);

    if (!results) {
      return null;
    }

    if (!results[2]) {
      return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
}
