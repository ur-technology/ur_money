import { NgZone, Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';
import {IdentityVerificationProfilePage} from '../identity-verification-profile/identity-verification-profile';
import {InAppPurchase} from 'ionic-native';

@Component({
  templateUrl: 'build/pages/identity-verification/identity-verification-intro/identity-verification-intro.html',
  pipes: [TranslatePipe]
})
export class IdentityVerificationIntroPage {
  verificationProductId: string = 'technology.ur.urmoneyapp.verify_identity';
  purchaseMessage: string;

  constructor(private nav: NavController, private translateService: TranslateService, private ngZone: NgZone) {
  }

  ngOnInit() {
    this.getProductPrice();
  }

  goToProfile() {
    this.nav.push(IdentityVerificationProfilePage);
  }

  getProductPrice() {
    let self = this;
    InAppPurchase
      .getProducts([this.verificationProductId])
      .then((products) => {
        self.ngZone.run(() => {
          this.purchaseMessage = self.translateService.instant('identity-verification-intro.costToBuy', { value: products[0].price });
        });
      })
      .catch(function(err) {
      });
  }

}
