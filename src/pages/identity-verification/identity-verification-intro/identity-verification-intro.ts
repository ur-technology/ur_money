import { NgZone, Component } from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';
import {IdentityVerificationPersonalInfoPage} from '../identity-verification-personal-info/identity-verification-personal-info';
import {InAppPurchase} from 'ionic-native';

@Component({
  templateUrl: 'build/pages/identity-verification/identity-verification-intro/identity-verification-intro.html',
  pipes: [TranslatePipe]
})
export class IdentityVerificationIntroPage {
  verificationProductId: string = 'technology.ur.urmoneyapp.verify_identity';
  purchaseMessage: string;

  constructor(private nav: NavController, private platform: Platform, private translateService: TranslateService, private ngZone: NgZone) {
  }

  ngOnInit() {
    this.getProductPrice();
  }

  goToProfile() {
    this.nav.push(IdentityVerificationPersonalInfoPage);
  }

  getProductPrice() {
    let self = this;
    if (self.platform.is('cordova')) {
      InAppPurchase.getProducts([this.verificationProductId]).then((products) => {
        self.ngZone.run(() => {
          self.setPurchaseMessage(products[0].price);
        });
      }).catch(function(err) {
      });
    } else {
      self.setPurchaseMessage(2.99);
    }
  }

  setPurchaseMessage(price) {
    this.purchaseMessage = this.translateService.instant('identity-verification-intro.costToBuy', { value: price });
  }
}
