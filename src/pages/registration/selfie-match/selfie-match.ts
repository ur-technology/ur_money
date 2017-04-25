import { NavController, NavParams, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { ProfileSetupPage } from '../profile-setup/profile-setup';
import { AcuantService } from '../../../services/acuant';
import { IDVerifier } from '../../../interfaces/id-verifier';
import { HomePage } from '../../../pages/home/home';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

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
  pageName = 'SelfieMatchPage';

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public loadingController: LoadingController,
    public auth: AuthService,
    private toastCtrl: ToastController,
    private acuantService: AcuantService,
    public alertCtrl: AlertController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {

    this.idVerifier = acuantService;
    this.mainForm = new FormGroup({});
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
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
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked submit selfie button', 'submit()');
    let destinationPage: any = ProfileSetupPage;

    if (this.auth.currentUser.wallet && this.auth.currentUser.wallet.address) {
      destinationPage = HomePage;
    }

    let loadingModal = this.loadingController.create({ content:"Please wait..." });
    loadingModal.present();

    this.idVerifier.matchSelfie(this.dataURLtoBlob(this.selfieSource))
      .then(() => {
        loadingModal.dismiss().then(() => {
          this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Selfie matched', 'submit()');
          this.nav.setRoot(destinationPage);
        });
      },
      (error) => {
        this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Selfie matched failed'+ error, 'submit()');
        trackJs.track('Selfie match failed: ' + error);
        loadingModal.dismiss().then(() => {

          let confirm = this.alertCtrl.create({
            title: "Couldn't match your selfie to your ID",
            message: "We couldn't process your ID.",
            buttons: [
              {
                text: "Try again",
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
