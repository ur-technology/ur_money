import {Page, NavController, Component} from 'ionic-angular';
// import {Component} from '@angular/core';
// import {FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl, Control} from '@angular/common';
import {Auth} from '../../components/auth/auth';
import {Welcome2Page} from './welcome2';

@Page({
  templateUrl: 'build/pages/welcome/welcome1.html'
})
export class Welcome1Page {

  public welcome2Page: Component;

  constructor(
    public nav: NavController
  ) {
    this.nav = nav;
    this.welcome2Page = Welcome2Page;
  }


}

// import {Page} from 'ionic-angular';
//
//
// @Page({
//   templateUrl: 'build/pages/welcome/welcome1.html'
// })
// export class Welcome1Page {
//   constructor() {
//
//   }
// }
