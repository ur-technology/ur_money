import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService } from '../../../services/auth';
import { ProfileSetupPage } from '../profile-setup/profile-setup';
import { AcuantService } from '../../../services/acuant';
import { IDVerifier } from '../../../interfaces/id-verifier';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import * as log from 'loglevel';

declare var $;

@Component({
  selector: 'selfie-match-page',
  templateUrl: 'selfie-match.html',
})
export class SelfieMatchPage {
  mainForm: FormGroup;
  errorMessage: string;
  selfieSource: string;
  facialMatchData: string;
  idCardFaceImage: any;
  idCardFinalImage: any;
  idVerifier: IDVerifier;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public auth: AuthService,
    private toastCtrl: ToastController,
    private acuantService: AcuantService,
  ) {

    this.idVerifier = acuantService;
    this.mainForm = new FormGroup({});
    this.idCardFaceImage = this.navParams.get('idCardFaceImage');

    let byteArray: string = (<any>window).goog.crypt.base64.encodeByteArray(this.idCardFaceImage);
    this.idCardFinalImage = `data:image/jpg;base64,${byteArray}`;
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
        this.selfieSource = data;
      }
    });
  }

  selfieUploaded() {
    return $("#selfie").val() !== '';
  }

  submit() {

    let loadingModal = this.loadingController.create({ content: this.translate.instant('pleaseWait') });
    loadingModal.present();

    let currentUserRef = firebase.database().ref(`/users/${this.auth.currentUserId}`);

    currentUserRef.update({ selfieSource: this.selfieSource }).then(() => {
      return this.idVerifier.matchSelfie(
        this.dataURLtoBlob(this.idCardFinalImage),
        this.dataURLtoBlob(this.selfieSource),
      )
    })
      .then((facialMatchData) => {

        this.facialMatchData = facialMatchData

        loadingModal.dismiss().then(() => {
          return currentUserRef.update({ facialMatchData: this.facialMatchData });
        });
      })
      .then(() => {
        this.nav.push(ProfileSetupPage);
      },
      (error) => {
        log.warn(error);
        loadingModal.dismiss().then(() => {
          this.toastCtrl.create({
            message: 'There was an error matching your selfie.',
            duration: 6000,
            position: 'bottom'
          }).present();
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

}
