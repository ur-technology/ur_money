import { NavController, NavParams, Platform} from 'ionic-angular';
import {ChartDataService} from '../../services/chart-data';
import {ElementRef, Inject, NgZone, Component} from '@angular/core';
import {ContactsAndChatsPage} from '../contacts-and-chats/contacts-and-chats';
import * as moment from 'moment';
import {AngularFire} from 'angularfire2';
import {AuthService} from '../../services/auth';
import {Config} from '../../config/config';
import {IdentityVerificationIntroPage} from '../identity-verification/identity-verification-intro/identity-verification-intro';
import {CountryNotSupportedPage} from '../identity-verification/country-not-supported/country-not-supported';
import {VerificationPendingPage} from '../registration/verification-pending';
import { TranslateService} from 'ng2-translate/ng2-translate';
import {AnnouncementInitiatedPage} from '../identity-verification/announcement-initiated/announcement-initiated';
import {TransactionsPage} from './../transactions/transactions';
import {SendPage} from './../send/send';
import {IdentityVerificationSponsorWaitPage} from '../identity-verification/identity-verification-sponsor-wait/identity-verification-sponsor-wait';
import {InviteLinkPage} from './../invite-link/invite-link';
declare var jQuery: any;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html',
})
export class HomePage {
  elementRef: ElementRef;
  sendButtonHidden: boolean;
  sendButtonDisabled: boolean;
  needsToCompleteProfile: boolean;
  balanceTitle: string;
  selectedOption: any;

  constructor( @Inject(ElementRef) elementRef: ElementRef, public nav: NavController,
    navParams: NavParams, public chartData: ChartDataService, public platform: Platform,
    public angularFire: AngularFire, public auth: AuthService, public ngZone: NgZone,
    public translate: TranslateService

  ) {
    this.elementRef = elementRef;
    this.sendButtonHidden = Config.targetPlatform === 'ios';
    this.sendButtonDisabled = true;
  }

  reflectAvailableBalanceOnPage() {
    if (this.accountReady()) {
      if (this.chartData.balanceUpdated) {
        this.balanceTitle = `${this.chartData.balanceInfo.availableBalance.toFormat(2)}<span>&nbsp;UR</span>`;
        this.ngZone.run(() => {
          this.balanceTitle = `${this.chartData.balanceInfo.availableBalance.toFormat(2)}<span>&nbsp;UR</span>`;
          this.sendButtonDisabled = false;
        });
      } else {
        this.balanceTitle = '...';
      }
    } else {
      this.balanceTitle = this.translate.instant(
        {
          'verification-initiated': 'home.verificationPending',
          'verification-requested': 'home.verificationPending', // deprecated
          'verification-pending': 'home.verificationFailed',
          'verification-failed': 'home.verificationFailed',
          'announcement-requested': 'home.bonusGenerating',
          'announcement-initiated': 'home.bonusGenerating',
          'verification-succeeded': 'home.bonusGenerating',
          'waiting-for-sponsor': 'home.waitingSponsor'
        }[this.auth.getUserStatus()] || 'home.unlockMessage'
      );
    }
  }

  ionViewDidEnter() {
    let self = this;

    if (self.chartData.pointsLoaded) {
      self.renderChart();
    }
    self.chartData.pointsLoadedEmitter.subscribe((data) => {
      self.renderChart();
    });
    self.reflectAvailableBalanceOnPage();
    self.chartData.balanceUpdatedEmitter.subscribe((balanceInfo) => {
      this.auth.reloadCurrentUser().then(() => {
        self.reflectAvailableBalanceOnPage();
      });
    });
  }

  startNewChat() {
    this.nav.push(ContactsAndChatsPage, { goal: 'chat' }, { animate: true, direction: 'forward' });
  }

  setRoot(page) {
    this.nav.setRoot(page, {}, { animate: true, direction: 'forward' });
  }

  loadChartPoints(duration: number, unitOfTime: moment.UnitOfTime) {
    this.chartData.loadPointsAndCalculateMetaData(duration, unitOfTime);
  }

  renderChart() {
    jQuery(this.elementRef.nativeElement).find('.container').highcharts({
      chart: {
        type: 'area',
        backgroundColor: null,
        // Edit chart spacing
        spacingBottom: 0,
        spacingTop: 10,
        spacingLeft: 0,
        spacingRight: 0
      },
      title: {
        text: false
      },
      xAxis: {
        title: {
          enabled: false
        },
        visible: false
      },
      yAxis: {
        title: {
          text: 'UR Balance'
        },
        labels: {
          enabled: false
        },
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        min: 0
      },
      tooltip: {
        headerFormat: '',
        pointFormat: '{point.x:%e-%b %I:%M %p}: {point.y:.2f} UR'
      },

      plotOptions: {
        spline: {
          marker: {
            enabled: true
          }
        }
      },
      series: [{
        name: '',
        showInLegend: false,
        data: this.chartData.dataSeries(),
        color: '#a5d3e9'
        // step: 'left'
      }],
      exporting: { enabled: false },
      legend: { enabled: false },
      credits: {
        enabled: false
      }

    });
  }

  send() {
    if (Config.targetPlatform === 'web') {
      this.nav.push(SendPage, { contact: {} }, { animate: true, direction: 'forward' });
    } else {
      this.nav.push(ContactsAndChatsPage, { goal: 'send' }, { animate: true, direction: 'forward' });
    }
  }

  request() {
    this.nav.push(ContactsAndChatsPage, { goal: 'request' }, { animate: true, direction: 'forward' });
  }

  invite() {
    if (Config.targetPlatform === 'web') {
      this.nav.push(InviteLinkPage, { animate: true, direction: 'forward' });
    } else {
      this.nav.push(ContactsAndChatsPage, { goal: 'invite' }, { animate: true, direction: 'forward' });
    }
  }

  accountReady() {
    return this.auth.getUserStatus() === 'announcement-confirmed';
  }

  goToNextStep() {
    if (this.accountReady()) {
      this.nav.push(TransactionsPage);
    } else if (this.auth.userCountryNotSupported()) {
      this.nav.push(CountryNotSupportedPage);
    } else {
      this.nav.push({
        'verification-initiated': VerificationPendingPage,
        'verification-requested': VerificationPendingPage, // deprecated
        'verification-pending': IdentityVerificationIntroPage,
        'verification-failed': IdentityVerificationIntroPage,
        'announcement-initiated': AnnouncementInitiatedPage,
        'announcement-requested': AnnouncementInitiatedPage,
        'verification-succeeded': AnnouncementInitiatedPage,
        'waiting-for-sponsor': IdentityVerificationSponsorWaitPage
      }[this.auth.getUserStatus()] || IdentityVerificationIntroPage);
    }
  }
}
