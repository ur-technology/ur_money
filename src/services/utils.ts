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

  static toE164FormatPhoneNumber(phone: string, currentUserCountryCode: string): string {
    let e164Phone;
    let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    let phoneNumberFormat = require('google-libphonenumber').PhoneNumberFormat;
    try {
      let initialPlus = /^\+/.test(phone);
      let strippedPhone = phone.replace(/\D/g, '');
      if (!strippedPhone) {
        return undefined;
      }
      if (initialPlus) {
        strippedPhone = '+' + strippedPhone;
      }

      let phoneNumberObject = phoneNumberUtil.parse(strippedPhone, currentUserCountryCode);
      if (phoneNumberUtil.isValidNumber(phoneNumberObject)) {
        e164Phone = phoneNumberUtil.format(phoneNumberObject, phoneNumberFormat.E164);
        if (currentUserCountryCode === 'MX' && /^\+52[2-9]/.test(e164Phone)) {
          // In Mexico, The 1 after +52 indicates that a number is mobile,
          // but it's often left out of contacts because most carriers don't require it.
          // If the 1 is  missing, we add it back to normalize the number.
          e164Phone = '+521' + e164Phone.substring(3);
          let phoneNumberObject = phoneNumberUtil.parse(strippedPhone, currentUserCountryCode); // TODO: handle this better
          e164Phone = phoneNumberUtil.format(phoneNumberObject, phoneNumberFormat.E164);
        }

      }
    } catch (e) {
      if (!/The string supplied did not seem to be a phone number/.test(e.message)) {
        log.debug(`error parsing or validating phone number '${phone}': ${e.message}`);
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
