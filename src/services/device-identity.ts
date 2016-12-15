// import { Injectable } from '@angular/core';
// import { Platform } from 'ionic-angular';
// import {Http } from '@angular/http';
// import 'rxjs/add/operator/map';
// import {DeviceIdentityModel} from '../models/device-identity';
//
// // Native plugin
// import {Device} from 'ionic-native';
// import {Geolocation} from 'ionic-native';
//
//
// @Injectable()
// export class DeviceIdentityService {
//   deviceIdentity: DeviceIdentityModel;
//   constructor(public http: Http, public platform: Platform) {
//     this.deviceIdentity = new DeviceIdentityModel();
//     this.getIpAddress();
//     this.getDeviceInformation();
//     this.getDeviceLocation();
//
//   }
//
//   getIpAddress() {
//     this.http.get('http://ipv4.myexternalip.com/json')
//       .map(res => res.json()).subscribe((data) => {
//         if (data) {
//           this.deviceIdentity.ipAddress = data.ip;
//         }
//       });
//   }
//
//   getDeviceInformation() {
//     this.platform.ready().then(() => {
//       this.deviceIdentity.deviceInfromation = Device.device;
//     });
//   }
//
//   getDeviceLocation() {
//     this.platform.ready().then(() => {
//       Geolocation.getCurrentPosition().then((resp) => {
//         this.deviceIdentity.geolocation = {
//           latitude: resp.coords.latitude,
//           longitude: resp.coords.longitude
//         };
//       });
//     });
//   }
// }
