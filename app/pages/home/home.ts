import {Page, NavController, NavParams, Platform} from 'ionic-angular';
import {WalletModel} from '../../models/wallet';
import {ChartDataService} from '../../services/chart-data';
import {ElementRef, Inject} from '@angular/core';
import {OrderBy}  from '../../pipes/orderBy';
import {Timestamp}  from '../../pipes/timestamp';
import {ContactsAndChatsPage} from '../contacts-and-chats/contacts-and-chats';
import * as moment from 'moment';
import {Round} from '../../pipes/round';
import {EventListComponent} from '../../components/event-list/event-list';
import {AngularFire} from 'angularfire2';
import {AuthService} from '../../services/auth';
import {BigNumber} from 'bignumber.js';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/home/home.html',
  pipes: [OrderBy, Timestamp, Round],
  directives: [EventListComponent]
})
export class HomePage {
  elementRef: ElementRef;
  android: boolean;
  availableBalance: number;
  formattedAvailableBalance: string;

  constructor( @Inject(ElementRef) elementRef: ElementRef, private nav: NavController,
    navParams: NavParams, public chartData: ChartDataService, public platform: Platform,
    private angularFire: AngularFire, private auth: AuthService) {
    this.elementRef = elementRef;
    this.android = this.platform.is('android');
  }

  onPageWillEnter() {
    // TODO: determine pending outbound amounts
    let pendingAmounts: number = 0;
    WalletModel.availableBalanceAsync(this.auth.currentUser.wallet.address, true, pendingAmounts).then(balanceInfo => {
      this.availableBalance = balanceInfo.availableBalance;
      this.formattedAvailableBalance = this.formatUR(this.availableBalance);
    }, (error) => {
      this.availableBalance = this.formattedAvailableBalance = undefined;
    });
  }

  onPageDidEnter() {
    var self = this;
    if (self.chartData.pointsLoaded) {
      self.renderChart();
    }
    self.chartData.pointsLoadedEmitter.subscribe((data) => {
      self.renderChart();
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
        data: this.chartData.points,
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

  formatUR(amount: number): string {
    if (amount === 0 || amount) {
      return (new BigNumber(amount)).toFormat(2);
    } else {
      return '';
    }
  }
}
