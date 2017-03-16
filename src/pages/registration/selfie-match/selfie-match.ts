import { NavController, NavParams, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService } from '../../../services/auth';
import { ProfileSetupPage } from '../profile-setup/profile-setup';
import { AcuantService } from '../../../services/acuant';
import { IDVerifier } from '../../../interfaces/id-verifier';
import { HomePage } from '../../../pages/home/home';

declare var $;
declare var trackJs: any;

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
    public alertCtrl: AlertController,
  ) {

    this.idVerifier = acuantService;
    this.mainForm = new FormGroup({});
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
        this.selfieSource = data;
      }
    });
  }

  selfieUploaded() {
    return $("#selfie").val() !== '';
  }

  submit() {

    let destinationPage: any = ProfileSetupPage;

    if (this.auth.currentUser.wallet && this.auth.currentUser.wallet.address) {
      destinationPage = HomePage;
    }

    let loadingModal = this.loadingController.create({ content: this.translate.instant('pleaseWait') });
    loadingModal.present();

    this.idVerifier.matchSelfie(this.dataURLtoBlob(this.selfieSource))
      .then(() => {
        loadingModal.dismiss().then(() => {
          this.nav.setRoot(destinationPage);
        });
      },
      (error) => {
        trackJs.track('Selfie match failed: ' + error);
        loadingModal.dismiss().then(() => {

          let confirm = this.alertCtrl.create({
            title: this.translate.instant('selfie-match.cantMatchTitle'),
            message: this.translate.instant('selfie-match.cantMatchMessage'),
            buttons: [
              {
                text: this.translate.instant('selfie-match.tryAgain'),
                handler: () => {
                }
              }
            ]
          });
          confirm.present();
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
