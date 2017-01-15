import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Config} from '../config/config';

@Injectable()
export class DynamicLinkService {

  deeplink: string;

  constructor(public http: Http) { }

  getGeneratedDynamicLink(): string {
    return this.deeplink;
  }

  generateDynamicLink(referralCode) {
    let firebaseUrl = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${Config.firebaseApiKey}`;
    let body: any =
      {
        "dynamicLinkInfo": {
          "dynamicLinkDomain": Config.dynamicLinkDomain,
          "link": `https://${Config.deeplinkHost}/r/${referralCode}`,
          "androidInfo": {
            "androidPackageName": "technology.ur.urmoneyapp"
          },
          "socialMetaTagInfo": {
            "socialTitle": "UR Money",
            "socialDescription": "Join the UR network and get bonus UR",
            "socialImageLink": "https://ur.technology/wp-content/uploads/2016/11/icon-android-192x192.png"
          }
        }
      }
    let options = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' }) });

    this.http.post(firebaseUrl, body, options)
      .subscribe((data: Response) => {
        this.deeplink = data.json().shortLink;
      },
      error => {
        this.deeplink = `https://${Config.deeplinkHost}/r/${referralCode}`;
      });
  }
}
