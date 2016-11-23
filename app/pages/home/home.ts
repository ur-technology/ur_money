import {Page, NavController, NavParams, Platform} from 'ionic-angular';
import {ChartDataService} from '../../services/chart-data';
import {ElementRef, Inject, NgZone} from '@angular/core';
import {OrderBy}  from '../../pipes/orderBy';
import {Timestamp}  from '../../pipes/timestamp';
import {ContactsAndChatsPage} from '../contacts-and-chats/contacts-and-chats';
import * as moment from 'moment';
import {Round} from '../../pipes/round';
import {EventListComponent} from '../../components/event-list/event-list';
import {AngularFire} from 'angularfire2';
import {AuthService} from '../../services/auth';
import {BigNumber} from 'bignumber.js';
import {IdentityVerificationIntroPage} from '../identity-verification/identity-verification-intro/identity-verification-intro';
import {CountryNotSupportedPage} from '../registration/country-not-supported';
import {VerificationPendingPage} from '../registration/verification-pending';
import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';
import {AnnouncementInitiatedPage} from '../registration/announcement-initiated';
import * as _ from 'lodash';
declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/home/home.html',
  pipes: [OrderBy, Timestamp, Round, TranslatePipe],
  directives: [EventListComponent]
})
export class HomePage {
  elementRef: ElementRef;
  ios: boolean;
  availableBalance: BigNumber;
  needsToCompleteProfile: boolean;
  balanceTitle: string;

  constructor( @Inject(ElementRef) elementRef: ElementRef, private nav: NavController,
    navParams: NavParams, public chartData: ChartDataService, public platform: Platform,
    private angularFire: AngularFire, private auth: AuthService, private ngZone: NgZone, private translate: TranslateService
  ) {
    this.elementRef = elementRef;
    this.ios = this.platform.is('ios');
  }

  reflectAvailableBalanceOnPage() {
    this.availableBalance = this.chartData.balanceInfo.availableBalance;
  }

  onPageDidEnter() {
    let self = this;

    self.checkIfNeedsToCompleteProfile();

    if (self.chartData.pointsLoaded) {
      self.renderChart();
    }
    self.chartData.pointsLoadedEmitter.subscribe((data) => {
      self.renderChart();
    });

    if (self.chartData.balanceUpdated) {
      self.reflectAvailableBalanceOnPage();
    }
    self.chartData.balanceUpdatedEmitter.subscribe((balanceInfo) => {
      self.ngZone.run(() => {
        this.auth.reloadCurrentUser();
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
    this.nav.push(ContactsAndChatsPage, { goal: 'send' }, { animate: true, direction: 'forward' });
  }

  request() {
    this.nav.push(ContactsAndChatsPage, { goal: 'request' }, { animate: true, direction: 'forward' });
  }

  invite() {
    this.nav.push(ContactsAndChatsPage, { goal: 'invite' }, { animate: true, direction: 'forward' });
  }

  checkIfNeedsToCompleteProfile() {
    this.needsToCompleteProfile = this.auth.eligibleToVerifyAccount();

    this.balanceTitle = this.translate.instant({
      'verification-requested': 'home.verificationPending',
      'verification-pending': 'home.verificationPending',
      'verification-failed': 'home.unlockMessage',
      'wallet-generated': 'home.unlockMessage',
      'announcement-requested': 'home.bonusGenerating',
      'announcement-initiated': 'home.bonusGenerating'
    }[this.auth.getUserStatus()]);

  }

  completeProfile() {
    if (this.auth.isUserInSupportedCountry()) {
      this.nav.push({
        'verification-requested': VerificationPendingPage,
        'verification-pending': VerificationPendingPage,
        'verification-failed': IdentityVerificationIntroPage,
        'wallet-generated': IdentityVerificationIntroPage,
        'announcement-initiated': AnnouncementInitiatedPage,
        'announcement-requested': AnnouncementInitiatedPage
      }[this.auth.getUserStatus()]);
    } else {
      this.nav.push(CountryNotSupportedPage);
    }
  }

}
