export class CustomValidators {
  static emailValidator(control) {
    var pattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([-a-z0-9_]+)|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
    if (!control.value.match(pattern)) {
      return { 'invalidEmailAddress': true };
    }
  }
  static phoneValidator(control) {
    var pattern = /^(\D*\d\D*){10}$/;
    if (!control.value.match(pattern)) {
      return { 'invalidPhone': true };
    }
  }
  static phoneListValidator(control) {
    var pattern = /(\D*\d\D*){10,}(\n+(\D*\d\D*){10,})*/;
    if (!control.value.match(pattern)) {
      return { 'invalidPhoneList': true };
    }
  }
}
