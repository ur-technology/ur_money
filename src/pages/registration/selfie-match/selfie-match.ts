import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService } from '../../../services/auth';
import { ProfileSetupPage } from '../profile-setup/profile-setup';
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

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public auth: AuthService,
    private toastCtrl: ToastController
  ) {
    this.mainForm = new FormGroup({});
    this.idCardFaceImage = this.navParams.get('idCardFaceImage');
    this.selfieSource = "../../assets/img/selfie.placeholder.png";
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
    return true;
    // return $("#selfie").val() !== '';
  }

  submit() {
    let currentUserRef = firebase.database().ref(`/users/${this.auth.currentUserId}`);
    currentUserRef.update({ selfieSource: this.selfieSource }).then(() => {
      return this.matchSelfie();
    }).then(() => {
      return currentUserRef.update({ facialMatchData: this.facialMatchData });
    }).then(() => {
      this.nav.push(ProfileSetupPage);
    }, (error) => {
      log.warn(error);
      this.toastCtrl.create({
        message: 'There was an error matching your selfie.',
        duration: 6000,
        position: 'bottom'
      }).present();
    });
  }

  matchSelfie(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.idCardFaceImage) {
        resolve();
        return;
      }

      let loadingModal = this.loadingController.create({ content: this.translate.instant('pleaseWait') });
      loadingModal.present();

      let imageToProcess = new FormData();
      let byteArray: string = (<any>window).goog.crypt.base64.encodeByteArray(this.idCardFaceImage);
      let idCardFaceSource = `data:image/jpg;base64,${byteArray}`;
      imageToProcess.append("photo1", this.dataURLtoBlob(idCardFaceSource));
      imageToProcess.append("photo2", this.dataURLtoBlob(this.selfieSource));
      let authinfo = $.base64.encode("EE92924A123D");
      $.ajax({
        type: "POST",
        url: "https://cssnwebservices.com/CSSNService/CardProcessor/FacialMatch",
        data: imageToProcess,
        cache: false,
        contentType: 'application/octet-stream; charset=utf-8;',
        dataType: "json",
        processData: false,
        beforeSend: (xhr) => {
          xhr.setRequestHeader("Authorization", "LicenseKey " + authinfo);
        },
        success: (facialMatchData) => {
          loadingModal.dismiss().then(() => {
            this.facialMatchData = facialMatchData;
            let error: string = (facialMatchData.ResponseCodeAuthorization < 0 && facialMatchData.ResponseCodeAuthorization) ||
              (facialMatchData.WebResponseCode < 1 && facialMatchData.WebResponseCode);
            if (error) {
              reject(`error matching selfie: ${error}`);
            } else {
              resolve();
            }
          });
        },
        error: (xhr, error) => {
          loadingModal.dismiss().then(() => {
            reject(`error submitting id: ${_.toString(error)}`);
          });
        }
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
