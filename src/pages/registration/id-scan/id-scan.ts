import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService } from '../../../services/auth';
import { CustomValidator } from '../../../validators/custom';
import { SelfieMatchPage } from '../selfie-match/selfie-match';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import * as log from 'loglevel';

declare var $;

@Component({
  selector: 'id-scan-page',
  templateUrl: 'id-scan.html',
})
export class IdScanPage {
  mainForm: FormGroup;
  errorMessage: string;
  idCardFrontSource: string;
  idCardBackSource: string;
  idCardData: any;
  reformattedImageFrontSource: string;
  reformattedImageBackSource: string;
  faceMatchDataString: string;
  countries: any[];
  countryCode: string;

  constructor(
    public nav: NavController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public auth: AuthService,
    private toastCtrl: ToastController
  ) {
    let formElements: any = {
      firstName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      lastName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      middleName: new FormControl(''),
      name: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      countryCode: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, CustomValidator.emailValidator])
    };
    this.mainForm = new FormGroup(formElements);
    this.idCardFrontSource = "../../assets/img/id-card-front.placeholder.png";
    this.idCardBackSource = "../../assets/img/id-card-back.placeholder.png";
  }

  ionViewDidLoad() {
    this.fillCountriesArray();
  }

  private fillCountriesArray() {
    this.countries = _.sortBy(require('country-data').countries.all, 'name');
    this.countries = _.reject(this.countries, { alpha2: ['CU', 'IR', 'KP', 'SD', 'SY'] });  // remove forbidden countries
    this.countries = _.filter(this.countries, { status: 'assigned' });
    this.countryCode = this.countryCodeAssociatedWithPhone();
    let country = _.find(this.countries, { alpha2: this.countryCode });
    (<FormControl>this.mainForm.controls['countryCode']).setValue(country);
  }

  private countryCodeAssociatedWithPhone() {
    let phoneNumberUtil: any = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    let countryCode: string;
    try {
      let phoneNumberObject: any = phoneNumberUtil.parse(this.auth.currentUser.phone, '');
      countryCode = phoneNumberUtil.getRegionCodeForNumber(phoneNumberObject);
    } catch (e) {
      log.warn(`parse exception was thrown: ${e.toString()}`);
    }
    return countryCode || 'US';
  }

  onCountrySelected(countrySelected) {
    this.countryCode = countrySelected.alpha2;
  }

  selectFile(event) {
    let input = $(event.target).parents("div").children("input[type='file']");
    input.trigger('click');
  }

  fileChanged(event, cardType) {
    (<any>window).canvasResize(event.target.files[0], {
      crop: false,
      quality: 75,
      isiOS: false, // isMobile.iOS(),
      isPreprocessing: true,
      cardType: cardType,
      callback: (data, width, height) => {
        if ($(event.target).attr('id') === 'id-card-front') {
          this.idCardFrontSource = data;
        } else {
          this.idCardBackSource = data;
        }
      }
    });
  }

  idCardUploaded() {
    // FIXME! Remove this temporary hack
    return true;
    //return $("#id-card-front").val() !== '' && $("#id-card-back").val() !== '';
  }

  private regionSet(): string {
    if (this.countryCode === 'US') {
      return "0";
    } else if (this.countryCode === 'CA') {
      return "1";
    }

    let countryData = require('country-data');
    let continentKey = _.findKey(countryData.continents, (continent) => {
      return _.includes(continent.countries, this.countryCode);
    });
    switch (continentKey) {
      case 'northAmerica':
      case 'southAmerica':
        return '2';

      case 'europe':
        return '3';

      case 'australia':
        return '4';

      case 'asia':
        return '5';

      case 'africa':
        return '7';

      default:
        return '6';
    }

  }

  submit() {
    this.extractDataFromIdCard().then(() => {
      let currentUserRef = firebase.database().ref(`/users/${this.auth.currentUserId}`);
      return currentUserRef.update({ idCardData: _.omitBy(this.idCardData, _.isArray) });
    }).then(() => {
      this.nav.push(SelfieMatchPage, { idCardFaceImage: this.idCardData.FaceImage });
    }, (error) => {
      log.warn(error);
      this.toastCtrl.create({
        message: 'There was an error matching your selfie.',
        duration: 6000,
        position: 'bottom'
      }).present();
    });
  }

  extractDataFromIdCard(): Promise<any> {

    return new Promise((resolve, reject) => {

      // Temporarily skip this step
      if (this.idCardUploaded()) {
        this.idCardData = "no image";
        resolve();
        return;
      }

      let loadingModal = this.loadingController.create({ content: this.translate.instant('pleaseWait') });
      loadingModal.present();
      let imageToProcess = new FormData();
      imageToProcess.append("frontImage", this.dataURLtoBlob(this.idCardFrontSource));
      imageToProcess.append("backImage", this.dataURLtoBlob(this.idCardBackSource));
      let authinfo = $.base64.encode("EE92924A123D");
      let params: any[] = [
        this.regionSet(), // REGIONSET
        true, // AUTODETECTSTATE
        -1, // PROCSTATE
        true, // GETFACEIMAGE
        true, // GETSIGNIMAGE
        true, // REFORMATIMAGE
        0, // REFORMATIMAGECOLOR
        150, // REFORMATIMAGEDPI
        105, // IMAGESOURCE
        true // USEPREPROCESSING
      ];

      let paramString = _.join(_.map(params, _.toString), '/');
      $.ajax({
        type: "POST",
        url: `https://cssnwebservices.com/CSSNService/CardProcessor/ProcessDLDuplex/${paramString}`,
        data: imageToProcess,
        cache: false,
        contentType: 'application/octet-stream; charset=utf-8;',
        dataType: "json",
        processData: false,
        beforeSend: (xhr) => {
          xhr.setRequestHeader("Authorization", "LicenseKey " + authinfo);
        },
        success: (idCardData: any) => {
          this.idCardData = idCardData;
          loadingModal.dismiss().then(() => {
            let error: string = (idCardData.ResponseCodeAuthorization < 0 && idCardData.ResponseCodeAuthorization) ||
              (idCardData.ResponseCodeAutoDetectState < 0 && idCardData.ResponseCodeAutoDetectState) ||
              (idCardData.ResponseCodeProcState < 0 && idCardData.ResponseCodeProcState) ||
              (idCardData.WebResponseCode < 1 && idCardData.WebResponseCode);
            if (error) {
              reject(`error processing id: ${error}`);
            } else {
              resolve();
            }
          });
        },
        error: (xhr: any, error: any) => {
          loadingModal.dismiss().then(() => {
            reject(`error submitting id: ${_.toString(error)}`);
          });
        },
      });
    });
  }

  private dataURLtoBlob(dataURL: string): any {
    // Decode the dataURL
    var binary = atob(dataURL.split(',')[1]);
    // Create 8-bit unsigned array
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    // Return our Blob object
    return new Blob([new Uint8Array(array)], { type: 'image/jpg' });
  }

  private removeArrays(object: any): any {
    for (var k in object) {
      if (object[k] instanceof Array) {
        delete object[k];
      } else if (typeof object[k] === 'object') {
        this.removeArrays(object[k]);
      }
    }
  }

  // private removeUndefineds(objectOrArray: any): any {
  //   var isArray = objectOrArray instanceof Array;
  //   for (var k in objectOrArray) {
  //     if (objectOrArray[k] === undefined) {
  //       if (isArray) {
  //         objectOrArray.splice(k,1);
  //       } else {
  //         delete objectOrArray[k];
  //       }
  //     } else if (typeof objectOrArray[k] === 'object') {
  //       this.removeUndefineds(objectOrArray[k]);
  //     }
  //   }
  //   return objectOrArray;
  // }

}
