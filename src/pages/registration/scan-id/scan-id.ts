import {NavController} from 'ionic-angular';
import {Component} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {CustomValidator} from '../../../validators/custom';
// import {ProfileSetupPage} from '../profile-setup/profile-setup';
import * as _ from 'lodash';
import * as log from 'loglevel';

declare var $;

@Component({
  selector: 'scan-id-page',
  templateUrl: 'scan-id.html',
})
export class ScanIdPage {
  mainForm: FormGroup;
  errorMessage: string;
  previewSourceFront: string = "../../assets/img/id-card-front.placeholder.png";
  previewSourceBack: string = "../../assets/img/id-card-back.placeholder.png";
  extractedDataString: string;

  constructor(
    public nav: NavController
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

  selectFile(event) {
    let input = $(event.target).parents("div").children("#id-card-front,#id-card-back");
    input.trigger('click');
  }

  fileChanged(event) {
    let self = this;
    (<any>window).canvasResize(event.target.files[0], {
      crop: false,
      quality: 75,
      isiOS: false, // isMobile.iOS(),
      isPreprocessing: true,
      cardType: "DriversLicenseDuplex",
      callback: function (data, width, height) {
        if ($(event.target).attr('id') === 'id-card-front') {
          self.previewSourceFront = data;
        } else {
          self.previewSourceBack = data;
        }
      }
    });
  }

  imagesReady() {
    return $("#id-card-front").val() !== '' && $("#id-card-back").val() !== '';
  }

  submit() {
    let self = this;
    let imageToProcess = new FormData();
    imageToProcess.append("frontImage", this.dataURLtoBlob(this.previewSourceFront));
    imageToProcess.append("backImage", this.dataURLtoBlob(this.previewSourceBack));

    let selectedRegion = "0";
    let usePreprocessing = true;
    let authinfo = $.base64.encode("EE92924A123D");

    $.ajax({
      type: "POST",
      url: "https://cssnwebservices.com/CSSNService/CardProcessor/ProcessDLDuplex/" + selectedRegion + "/true/-1/true/true/true/0/150/105/" + usePreprocessing.toString(),
      data: imageToProcess,
      cache: false,
      contentType: 'application/octet-stream; charset=utf-8;',
      dataType: "json",
      processData: false,
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "LicenseKey " + authinfo);
        $('#loading').html("<img src='images/processing.gif'/>");
        $("#div-controls").hide();
      },
      success: function(data) {

        let driversLicense: any = $.parseJSON(JSON.stringify(data));
        log.info(`driverLicense=${JSON.stringify(data)}`);

        //Checking if there are errors returned.
        if (driversLicense.ResponseCodeAuthorization < 0) {
          $('#errorDiv').html("<p>CSSN Error Code: " + driversLicense.ResponseMessageAuthorization + "</p>");
        }
        else if (driversLicense.ResponseCodeAutoDetectState < 0) {
          $('#errorDiv').html("<p>CSSN Error Code: " + driversLicense.ResponseCodeAutoDetectStateDesc + "</p>");
        }
        else if (driversLicense.ResponseCodeProcState < 0) {
          $('#errorDiv').html("<p>CSSN Error Code: " + driversLicense.ResponseCodeProcStateDesc + "</p>");
        }
        else if (driversLicense.WebResponseCode < 1) {
          $('#errorDiv').html("<p>CSSN Error Code: " + driversLicense.WebResponseDescription + "</p>");
        }
        else {
          let extractedDataObject = _.omit(_.pickBy(driversLicense, (value, key) => { return !!value && !_.isObject(value); }), ['AuthenticationObject']);
          self.extractedDataString = JSON.stringify(extractedDataObject);

          // //Comment this line of code if returnBackImage is set to 'true'
          // $("#fileupload-container-back").fileupload("clear");
          //
          // //Display face, sign and reformatted images on UI
          // var faceImage = driversLicense.FaceImage;
          // if (faceImage !== null && faceImage !== "") {
          //   var base64FaceImage = (<any>window).goog.crypt.base64.encodeByteArray(faceImage);
          //   document.getElementById("faceImage").style.display = "inline";
          //   $("#face-image").attr("src", "data:image/jpg;base64," + base64FaceImage);
          // }
          //
          // var signImage = driversLicense.SignImage;
          // if (signImage != null && signImage != "") {
          //   var base64SignImage = (<any>window).goog.crypt.base64.encodeByteArray(signImage);
          //   document.getElementById("signImage").style.display = "inline";
          //   $("#signature-image").attr("src", "data:image/jpg;base64," + base64SignImage);
          // }
          //
          // var reformattedImageFront = driversLicense.ReformattedImage;
          // if (reformattedImageFront != null && reformattedImageFront != "") {
          //   var base64ReformattedImage = (<any>window).goog.crypt.base64.encodeByteArray(reformattedImageFront);
          //   document.getElementById("extractedData").style.display = "inline";
          //   $("#image-thumbnail-front img:first-child").attr("src", "data:image/jpg;base64," + base64ReformattedImage);
          //   $("#fileupload-container-back").hide();
          //   $("#container-camera > div > div:first-child").attr('class', 'col-xs-12 col-sm-12 col-lg-12');
          // }
          //
          // var reformattedImageBack = driversLicense.ReformattedImageTwo;
          // if (reformattedImageBack != null && reformattedImageBack != "") {
          //   var base64ReformattedImage = (<any>window).goog.crypt.base64.encodeByteArray(reformattedImageBack);
          //   document.getElementById("extractedData").style.display = "inline";
          //   $("#image-thumbnail-back img:first-child").attr("src", "data:image/jpg;base64," + base64ReformattedImage);
          // }
          //

        }
      },
      error: function(xhr, err) {
        $("#div-controls").hide();
      },
      complete: function(e) {
        $('#loading').html("");
        $("#div-controls").hide();
      }
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
