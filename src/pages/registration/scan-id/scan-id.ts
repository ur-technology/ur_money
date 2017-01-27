import {NavController} from 'ionic-angular';
import {Component, ViewChild, Renderer} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {CustomValidator} from '../../../validators/custom';
// import {ProfileSetupPage} from '../profile-setup/profile-setup';

@Component({
  selector: 'scan-id-page',
  templateUrl: 'scan-id.html',
})
export class ScanIdPage {
  mainForm: FormGroup;
  errorMessage: string;
  @ViewChild('fileInput') fileInput;
  preprocessedFrontImage: any;
  preprocessedBackImage: any;

  constructor(
    public nav: NavController,
    private renderer: Renderer
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
  }

  ionViewDidLoad() {
  }

  selectFile() {
    let event = new MouseEvent('click', {bubbles: true});
    this.renderer.invokeElementMethod( this.fileInput.nativeElement, 'dispatchEvent', [event]);
  }

  fileChanged(fileInput) {
    let self = this;
    console.log("window.location.href", window.location.href);
    (<any>window).canvasResize(fileInput.files[0], {
      crop: false,
      quality: 75,
      isiOS: false, // fix this
      isPreprocessing: true,
      cardType: "DriversLicenseDuplex",
      callback: function (data, width, height) {
        self.preprocessedFrontImage = self.dataURLtoBlob(data);
      }
    });

  }

  submit() {
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
