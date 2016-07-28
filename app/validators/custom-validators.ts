import {ControlGroup} from '@angular/common';
import * as _ from 'lodash';

export class CustomValidators {
  static normalizedPhone(phone) {
    let p = phone;
    p = p.replace(/\D/g,'');
    p = p.replace(/^011/,"+");
    p = p.replace(/^664(\d{7})$/,"+521664$1");
    p = p.replace(/^\+?521?(\d{10})$/,"+521$1");
    p = p.replace(/^(\d{10})$/,"+1$1");
    p = p.replace(/^1(\d{10})$/,"+1$1");
    return p;
  }

  static emailValidator(control) {
    var pattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([-a-z0-9_]+)|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
    if (!control.value.match(pattern)) {
      return { 'invalidEmailAddress': true };
    }
  }

  static phoneValidator(control) {
    let normalizedPhone = CustomValidators.normalizedPhone(control.value);
    if (!/^\+(\d{1,3})(\d{10,})$/.test(normalizedPhone)) {
      return { 'invalidPhone': true };
    }
  }
  static phoneListValidator(control) {
    var pattern = /(\D*\d\D*){10,}(\n+(\D*\d\D*){10,})*/;
    if (!control.value.match(pattern)) {
      return { 'invalidPhoneList': true };
    }
  }
  static verificationCodeValidator(control) {
    var pattern = /^\d{6}$/;
    if (!control.value.match(pattern)) {
      return { 'invalidVerificationCode': true };
    }
  }

  static nameValidator(control) {
    if (control && _.isString(control.value) && !control.value.match(/\w+/)) {
      return { 'invalidName': true };
    }
  }

  static secretPhraseValidator(control) {
    var pattern = /^ *([^\b]+ ){4}[^\b]+ *$$/;
    if (!control.value.match(pattern)) {
      return { 'invalidSecretPhrase': true };
    }
  }

  static matchingSecretPhrases(controlName1: string, controlName2: string) {
    return (group: ControlGroup) => {
      let control1 = group.controls[controlName1];
      let control2 = group.controls[controlName2];
      if (!control1 || !control1.value || !control2 || !control2.value || control1.value != control2.value) {
        return control2.setErrors({notEquivalent: true})
      }
    }
  }

}