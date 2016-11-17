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
import {IdentityVerificationIntroPage} from '../identity-verification-intro/identity-verification-intro';
import * as _ from 'lodash';
declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/home/home.html',
  pipes: [OrderBy, Timestamp, Round],
  directives: [EventListComponent]
})
export class HomePage {
  elementRef: ElementRef;
  android: boolean;
  availableBalance: BigNumber;

  constructor( @Inject(ElementRef) elementRef: ElementRef, private nav: NavController,
    navParams: NavParams, public chartData: ChartDataService, public platform: Platform,
    private angularFire: AngularFire, private auth: AuthService, private ngZone: NgZone
  ) {
    this.elementRef = elementRef;
    this.android = this.platform.is('android');


  }

  reflectAvailableBalanceOnPage() {
    this.availableBalance = this.chartData.balanceInfo.availableBalance;
  }

  onPageDidEnter() {
    let self = this;

    if (self.chartData.pointsLoaded) {
      self.renderChart();
    }
    self.chartData.pointsLoadedEmitter.subscribe((data) => {
      self.renderChart();
    });

    if (self.chartData.balanceUpdated) {
      this.auth.reloadCurrentUser();
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

  isIdentityVerified() {
    let status = _.trim((this.auth.currentUser.registration && this.auth.currentUser.registration.status) || '') || 'initial';
    return status === 'announcement-succeeded' ? true : false;
  }

  completeProfile() {
    this.nav.push(IdentityVerificationIntroPage);

  }
}
