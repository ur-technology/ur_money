import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService } from '../../../services/auth';
import { CustomValidator } from '../../../validators/custom';
import { SelfieMatchPage } from '../selfie-match/selfie-match';
import { AcuantService } from '../../../services/acuant';
import { IDVerifier } from '../../../interfaces/id-verifier';
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
  idVerifier: IDVerifier;

  constructor(
    public nav: NavController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public auth: AuthService,
    private toastCtrl: ToastController,
    private acuantService: AcuantService,
  ) {

    this.idVerifier = acuantService;

    let formElements: any = {
      firstName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      lastName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      middleName: new FormControl(''),
      name: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      countryCode: new FormControl('', Validators.required),
      idType: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, CustomValidator.emailValidator])
    };

    this.mainForm = new FormGroup(formElements);
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
    return $("#id-card-front").val() !== '' && $("#id-card-back").val() !== '';
  }

  submit() {

    let loadingModal = this.loadingController.create({ content: this.translate.instant('pleaseWait') });
    loadingModal.present();

    this.idVerifier.extractDataFromNationalID(
      this.countryCode,
      this.dataURLtoBlob(this.idCardFrontSource),
      this.dataURLtoBlob(this.idCardBackSource),
    )
      .then((idCardData: any) => {

        this.idCardData = idCardData;

        loadingModal.dismiss().then(() => {
          let currentUserRef = firebase.database().ref(`/users/${this.auth.currentUserId}`);
          return currentUserRef.update({ idCardData: _.omitBy(this.idCardData, _.isArray) });
        });
      })
      .then((idCardData: any) => {
        this.nav.push(SelfieMatchPage, { idCardFaceImage: this.idCardData.FaceImage });
      },
      (error) => {
        log.warn(error);
        loadingModal.dismiss().then(() => {
          this.toastCtrl.create({
            message: 'Your ID hasn\'t been recognised. Please try again.', // FIXME! Translate
            duration: 6000,
            position: 'bottom'
          }).present();
        });
      });
  }

  private dataURLtoBlob(dataURL: string): Blob {
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
}
