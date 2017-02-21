import {Injectable} from '@angular/core';
import {Config} from '../config/config';
import * as _ from 'lodash';

@Injectable()
export class UtilService {

  private envMode() {
    let matches = Config.firebaseProjectId.match(/ur-money-(\w+)/);
    return (matches && matches[1]) || 'unknown';
  }

  envModeDisplay() {
    let mode = this.envMode();
    return mode === 'production' ? '' : `${_.startCase(mode)} mode`;
  }

  referralLink(referralCode): string {
    return `https://${Config.deeplinkHost}/r/${referralCode}`;
  }
}
