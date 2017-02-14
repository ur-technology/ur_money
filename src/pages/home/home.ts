import { NavController, NavParams, Platform } from 'ionic-angular';
import { ChartDataService } from '../../services/chart-data.service';
import { ElementRef, Inject, Component } from '@angular/core';
import { ContactsAndChatsPage } from '../contacts-and-chats/contacts-and-chats';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AngularFire } from 'angularfire2';
import { AuthService } from '../../services/auth';
import { Config } from '../../config/config';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AnnouncementInitiatedPage } from '../announcement-initiated/announcement-initiated';
import { TransactionsPage } from './../transactions/transactions';
import { SendPage } from './../send/send';
import { InviteLinkPage } from './../invite-link/invite-link';
import { SponsorWaitPage } from '../sponsor-wait/sponsor-wait';
import { BigNumber } from 'bignumber.js';
declare var jQuery: any;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {
  elementRef: ElementRef;
  sendButtonHidden: boolean;
  needsToCompleteProfile: boolean;
  balanceTitle: string;
  balanceValue: any = new BigNumber(0);
  selectedOption: any;
  balanceChangeUR: any;
  balanceChangePercent: any;

  constructor( @Inject(ElementRef) elementRef: ElementRef, public nav: NavController,
    navParams: NavParams, public chartData: ChartDataService, public platform: Platform,
    public angularFire: AngularFire, public auth: AuthService,
    public translate: TranslateService

  ) {
    this.elementRef = elementRef;
    this.sendButtonHidden = Config.targetPlatform === 'ios';
  }

  ionViewDidEnter() {
    this.renderChart();
    this.auth.walletChanged.subscribe(() => {
      this.setBalanceValues();
    });
    this.auth.walletChanged.emit({});
    this.chartData.pointsLoadedEmitter.subscribe(() => {
      this.setBalanceValues();
      this.renderChart();
    });
  }

  private setBalanceValues() {
    if (this.auth.announcementConfirmed()) {
      this.balanceValue = this.auth.currentBalanceUR();
      this.balanceTitle = null;
    } else {
      this.balanceValue = new BigNumber(2000);
      this.balanceTitle = this.translate.instant(
        {
          'waiting-for-sponsor': 'home.waitingForSponsor',
          'disabled': 'home.userDisabled'
        }[this.auth.getUserStatus()] || 'home.bonusGenerating'
      );
    }
    if (this.auth.announcementConfirmed() && this.chartData.pointsLoaded) {
      let firstTransaction = _.first(this.chartData.transactionsWithinTimeRange());
      let startingBalanceWei = this.chartData.priorBalanceWei || new BigNumber(firstTransaction ? firstTransaction.balance : 0);
      let balanceChangeWei = this.auth.currentBalanceWei().minus(startingBalanceWei);
      this.balanceChangeUR = balanceChangeWei.dividedBy(1000000000000000000).round(0, BigNumber.ROUND_HALF_FLOOR);
      this.balanceChangePercent = startingBalanceWei.isZero() ? null : balanceChangeWei.times(100).dividedBy(startingBalanceWei).round(0, BigNumber.ROUND_HALF_FLOOR);
    } else {
      this.balanceChangeUR = null;
      this.balanceChangePercent = null;
    }
  }

  startNewChat() {
    this.nav.push(ContactsAndChatsPage, { goal: 'chat' });
  }

  setRoot(page) {
    this.nav.setRoot(page, {});
  }

  loadChartPoints(duration: number, unitOfTime: moment.UnitOfTime) {
    this.chartData.loadPointsAndCalculateMetaData(duration, unitOfTime);
  }

  renderChart() {
    if (!this.chartData.pointsLoaded) {
      return;
    }
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
    this.nav.push(SendPage, { contact: {} });
  }

  request() {
    this.nav.push(ContactsAndChatsPage, { goal: 'request' });
  }

  invite() {
    if (Config.targetPlatform === 'web') {
      this.nav.push(InviteLinkPage);
    } else {
      this.nav.push(ContactsAndChatsPage, { goal: 'invite' });
    }
  }

  accountReady() {
    return this.auth.getUserStatus() === 'announcement-confirmed';
  }

  goToNextStep() {
    if (this.accountReady()) {
      this.nav.push(TransactionsPage);
    } else {
      this.nav.push({
        'announcement-initiated': AnnouncementInitiatedPage,
        'announcement-requested': AnnouncementInitiatedPage,
        'announcement-confirmed': AnnouncementInitiatedPage,
        'waiting-for-sponsor': SponsorWaitPage
      }[this.auth.getUserStatus()] || AnnouncementInitiatedPage);
    }
  }
}
