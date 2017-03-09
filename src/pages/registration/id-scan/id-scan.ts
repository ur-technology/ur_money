import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService } from '../../../services/auth';
import { CustomValidator } from '../../../validators/custom';
import { SelfieMatchPage } from '../selfie-match/selfie-match';
import { AcuantService } from '../../../services/acuant';
import { IDVerifier } from '../../../interfaces/id-verifier';
import * as _ from 'lodash';

declare var $;
declare var trackJs: any;

const NATIONAL_ID = 'national-id';

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
  idTypes: any[];
  idType: string;
  idVerifier: IDVerifier;

  constructor(
    public nav: NavController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public auth: AuthService,
    private acuantService: AcuantService,
    public alertCtrl: AlertController,
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
    this.fillIdTypesArray();
  }

  private fillCountriesArray() {
    this.countries = _.sortBy(require('country-data').countries.all, 'name');
    this.countries = _.reject(this.countries, { alpha2: ['CU', 'IR', 'KP', 'SD', 'SY'] });  // remove forbidden countries
    this.countries = _.filter(this.countries, { status: 'assigned' });
    this.countryCode = this.auth.currentUser.countryCode;
    let country = _.find(this.countries, { alpha2: this.countryCode });
    (<FormControl>this.mainForm.controls['countryCode']).setValue(country);
  }

  private fillIdTypesArray() {

    this.idTypes = [
      { id: NATIONAL_ID, name: this.translate.instant('id-scan.nationalId') },
    ];

    this.idType = NATIONAL_ID;
    (<FormControl>this.mainForm.controls['idType']).setValue(this.idType);
  }

  onCountrySelected(countrySelected) {
    this.countryCode = countrySelected.alpha2;
  }

  selectFile(event) {
    let input = $(event.target).children("input[type='file']");
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

  idCardUploaded(): boolean {

    if (this.idType == NATIONAL_ID) {
      return $("#id-card-front").val() !== '' && $("#id-card-back").val() !== '';
    }

    return false;
  }

  submit() {

    let loadingModal = this.loadingController.create({ content: this.translate.instant('pleaseWait') });
    loadingModal.present();

    this.verifyID()
      .then((idCardData: any) => {

        this.idCardData = idCardData;

        loadingModal.dismiss().then(() => {
          this.nav.push(SelfieMatchPage);
        });
      },
      (error) => {
        trackJs.track('ID scan failed: ' + error);
        loadingModal.dismiss().then(() => {
          this.alertCtrl.create({
            title: this.translate.instant('id-scan.cantMatchTitle'),
            message: this.translate.instant('id-scan.cantMatchMessage'),
            buttons: [
              {
                text: this.translate.instant('id-scan.tryAgain'),
                handler: () => {
                }
              },
              {
                text: this.translate.instant('id-scan.letAHumanDoIt'),
                handler: () => {
                  this.nav.setRoot(SelfieMatchPage);
                }
              }
            ]
          }).present();
        });
      });
  }

  private verifyID(): Promise<any> {

    if (this.idType == NATIONAL_ID) {
      return this.idVerifier.extractDataFromNationalID(
        this.countryCode,
        this.dataURLtoBlob(this.idCardFrontSource),
        this.dataURLtoBlob(this.idCardBackSource),
      );
    }

    return new Promise((resolve, reject) => {
      reject('unknown ID type');
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
