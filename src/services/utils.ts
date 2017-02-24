import {Config} from '../config/config';
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
}