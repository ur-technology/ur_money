import { Injectable } from '@angular/core';
import { IDData } from '../interfaces/id-verifier';
import { AuthService } from './auth';

import * as firebase from 'firebase';
import * as _ from 'lodash';
import * as log from 'loglevel';

// jQuery workaround
declare var $: any;

@Injectable()
export class AcuantService {

  currentUserRef: firebase.database.Reference;
  storageRef: firebase.storage.Reference;

  constructor(
    public auth: AuthService,
  ) {
    this.currentUserRef = firebase.database().ref(`/users/${auth.currentUserId}`);
    this.storageRef = firebase.storage().ref();
  }

  ///////////////////////////////////////////////////////////////
  // Interface methods
  ///////////////////////////////////////////////////////////////

  public extractDataFromNationalID(countryCode: string, front: Blob, back: Blob): Promise<IDData> {

    var frontImageRef = this.userIDPhotoRef('national-id-front.jpg');
    var backImageRef = this.userIDPhotoRef('national-id-back.jpg');

    return new Promise((resolve, reject) => {

      let taskRef;

      frontImageRef.put(front)

        // Front image upload success
        .then((frontSnapshot: any) => {
          return backImageRef.put(back);
        },
        // Front image upload failed
        (error) => {
          log.Warn(error);
          reject('Failed to upload image');
        })

        // Back image upload succeeded	
        .then((backSnapshot: any) => {

          taskRef = firebase.database().ref('/verifyIDQueue/tasks').push({
            id: this.auth.currentUserId,
            type: "national",
            regionSet: this.regionSet(countryCode),
          });

          return taskRef;
        },
        // Back image upload failed
        (error) => {
          log.Warn(error);
          reject('Failed to upload image');
        })

        // Verify ID queue success
        .then((result) => {

          let resultRef = taskRef.child('result');

          resultRef.on("value", (snapshot) => {

            let val = snapshot.val();

            if (!val) {
              return;
            }

            taskRef.remove();

            if (val.state == 'id_verification_success') {
              resolve();
            } else {
              reject(val.error)
            }
          });
        },
        // Verify ID queue failed
        (error) => {
          reject(error);
        })
    })
  }

  matchSelfie(selfieSource: Blob): Promise<any> {

    let taskRef: any;
    let imageRef = this.userIDPhotoRef('selfie.jpg');

    return new Promise((resolve, reject) => {

      imageRef.put(selfieSource)

        // Image upload success
        .then((snapshot: any) => {

          taskRef = firebase.database().ref('/verifySelfieQueue/tasks').push({
            id: this.auth.currentUserId,
          });

          return taskRef;
        },
        // Image upload failed
        (error) => {
          log.Warn(error);
          reject('Failed to upload image');
        })

        // Verify selfie queue success
        .then((result: any) => {

          let resultRef = taskRef.child('result');

          resultRef.on("value", (snapshot) => {

            let val = snapshot.val();

            if (!val) {
              return;
            }

            taskRef.remove();

            if (val.state === 'selfie_verification_success') {
              resolve();
            } else {
              log.info(val.error);
              reject(val.error)
            }
          });
        },
        // Verify selfie queue failure
        (error) => {
          reject(error);
        })

      /*
    let imageToProcess = new FormData();
    imageToProcess.append("photo1", idCardFinalImage);
    imageToProcess.append("photo2", selfieSource);

    // Fixme! get from config
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

        let error: string = (facialMatchData.ResponseCodeAuthorization < 0 && facialMatchData.ResponseCodeAuthorization) ||
          (facialMatchData.WebResponseCode < 1 && facialMatchData.WebResponseCode);
        if (error) {
          reject(`error matching selfie: ${error}`);
        } else {
          resolve(facialMatchData);
        }
      },
      error: (xhr, error) => {
        reject(`error submitting id: ${_.toString(error)}`);
      }
    });
    */
    });
  }

  ///////////////////////////////////////////////////////////////
  // Utility methods
  ///////////////////////////////////////////////////////////////

  private userIDPhotoURL(fileName: string): string {
    return 'user/' + this.auth.currentUserId + '/id-images/' + fileName;
  }

  private userIDPhotoRef(fileName: string): firebase.storage.Reference {
    return this.storageRef.child(this.userIDPhotoURL(fileName));
  }

  private regionSet(countryCode: string): string {

    if (countryCode === 'US') {
      return "0";
    } else if (countryCode === 'CA') {
      return "1";
    }

    let countryData = require('country-data');
    let continentKey = _.findKey(countryData.continents, (continent) => {
      return _.includes(continent.countries, countryCode);
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
}
