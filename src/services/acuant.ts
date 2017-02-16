import { Injectable } from '@angular/core';
import { IDData } from '../interfaces/id-verifier';

import * as _ from 'lodash';

// jQuery workaround
declare var $: any;

@Injectable()
export class AcuantService {

  ///////////////////////////////////////////////////////////////
  // Interface methods
  ///////////////////////////////////////////////////////////////

  public extractDataFromNationalID(countryCode: string, front: Blob, back: Blob): Promise<IDData> {

    return new Promise((resolve, reject) => {

      let imageToProcess = new FormData();
      imageToProcess.append("frontImage", front)
      imageToProcess.append("backImage", back)

      // FIXME! Move to config
      let authinfo = $.base64.encode("EE92924A123D");

      let params: any[] = [
        this.regionSet(countryCode), // REGIONSET
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
          let error: string = (idCardData.ResponseCodeAuthorization < 0 && idCardData.ResponseCodeAuthorization) ||
            (idCardData.ResponseCodeAutoDetectState < 0 && idCardData.ResponseCodeAutoDetectState) ||
            (idCardData.ResponseCodeProcState < 0 && idCardData.ResponseCodeProcState) ||
            (idCardData.WebResponseCode < 1 && idCardData.WebResponseCode);
          if (error) {
            reject(`error processing id: ${error}`);
          } else {
            resolve(idCardData);
          }
        },
        error: (xhr: any, error: any) => {
          reject(`error submitting id: ${_.toString(error)}`);
        },
      });
    });
  }

  ///////////////////////////////////////////////////////////////
  // Utility methods
  ///////////////////////////////////////////////////////////////

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
