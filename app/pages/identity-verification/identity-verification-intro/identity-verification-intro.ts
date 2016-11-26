import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';
import {IdentityVerificationProfilePage} from '../identity-verification-profile/identity-verification-profile';
import {InAppPurchase} from 'ionic-native';
import * as _ from 'lodash';

@Component({
  templateUrl: 'build/pages/identity-verification/identity-verification-intro/identity-verification-intro.html',
  pipes: [TranslatePipe]
})
export class IdentityVerificationIntroPage {
  verificationProductId: string = 'technology.ur.urmoneyapp.verification';
  disableContinueButton: boolean;
  purchaseMessage: string;
  isVerificationPurchased: boolean;

  constructor(private nav: NavController, private translateService: TranslateService) {
    this.disableContinueButton = true;
  }

  ngOnInit() {
    this.checkIfVerificationWasPurchased();
  }

  goToProfile() {
    if (this.isVerificationPurchased) {
      this.nav.push(IdentityVerificationProfilePage);
    } else {
      this.buyVerification();
    }
  }

  buyVerification() {
    let self = this;

    InAppPurchase
      .buy(self.verificationProductId)
      .then((data: any) => {
      })
      .then(() => {
        this.isVerificationPurchased = true;
        this.handleVerificationPurchased();
        self.nav.push(IdentityVerificationProfilePage);
      });

  }

  handleVerificationPurchased() {
    this.disableContinueButton = this.isVerificationPurchased;
    this.purchaseMessage = this.isVerificationPurchased ? this.translateService.instant('identity-verification-intro.verificationPurchased') : this.translateService.instant('identity-verification-intro.costToBuy');
  }

  checkIfVerificationWasPurchased() {
    let self = this;

    InAppPurchase
      .restorePurchases()
      .then((purchases) => {
        this.isVerificationPurchased = !_.isUndefined(_.find(purchases, ['productId', self.verificationProductId]));
        this.handleVerificationPurchased();
      })
      .catch((err) => {
      });

  }
}
