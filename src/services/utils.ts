import { Config } from '../config/config';
import * as _ from 'lodash';
import * as log from 'loglevel';

export class Utils {

  static envModeDisplay() {
    let matches = Config.firebaseProjectId.match(/ur-money-(\w+)/);
    let mode = (matches && matches[1]) || 'unknown';
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

  static toE164FormatPhoneNumber(phoneNumber: string, currentUserCountryCode: string): string {
    let e164Phone;
    try {
      let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
      let number = phoneUtil.parseAndKeepRawInput(phoneNumber, currentUserCountryCode);
      let phoneNumberFormat = require('google-libphonenumber').PhoneNumberFormat;

      if (phoneUtil.isValidNumber(number)) {
        e164Phone = phoneUtil.format(number, phoneNumberFormat.E164)
      }
    }
    catch (e) {
      if (!/The string supplied did not seem to be a phone number/.test(e.message)) {
        log.debug(`error parsing or validating phone number '${phoneNumber}': ${e.message}`);
      }
    }
    return e164Phone;
  }

  static validateAndParsePhoneNumber(phoneNumber: string, currentUserCountryCode: string): any {
    try {
      let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
      let number = phoneUtil.parseAndKeepRawInput(phoneNumber, currentUserCountryCode);
      let phoneNumberFormat = require('google-libphonenumber').PhoneNumberFormat;

      if (phoneUtil.isPossibleNumber(number)) {
        if (phoneUtil.isValidNumber(number)) {
          let parsedNumber = phoneUtil.format(number, phoneNumberFormat.E164)
          return { valid: true, parsedNumber };
        }
      }
      return { valid: false, phoneNumber };
    }
    catch (e) {
      return { valid: false, phoneNumber };
    }
  }

  static validateEmail(email: string) {
    return email.match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([-a-z0-9_]+)|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i);
  }

  static toInternationalFormatPhoneNumber(e164Phone: string, currentUserCountryCode: string): string {
    let formattedPhone;
    let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    let phoneNumberFormat = require('google-libphonenumber').PhoneNumberFormat;
    try {
      let phoneNumberObject = phoneNumberUtil.parse(e164Phone, currentUserCountryCode);
      formattedPhone = phoneNumberUtil.format(phoneNumberObject, phoneNumberFormat.INTERNATIONAL);
    } catch (e) {
      log.debug(`error formatting phone number '${formattedPhone}': ${e.message}`);
    }
    return formattedPhone;
  }
}
