import {Page, NavController, NavParams, Alert, Modal, Platform} from 'ionic-angular';
import {ChartData} from '../../components/chart-data/chart-data';
import {Component, OnInit, ElementRef, Inject} from '@angular/core';
import {OrderBy}  from '../../pipes/orderBy';
import {Timestamp}  from '../../pipes/timestamp';
import {AddressBookModal} from '../../components/address-book-modal/address-book-modal';
import {ReceivePage} from '../receive/receive';
import {SendPage} from '../send/send';
import {InvitePage} from '../invite/invite';
import {ConversationPage} from '../conversation/conversation';
import * as _ from 'lodash';
import * as underscore from 'underscore'
import * as moment from 'moment';
import {Round} from '../../pipes/round';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/home/home.html',
  pipes: [OrderBy, Timestamp, Round]
})
export class HomePage implements OnInit {
  elementRef: ElementRef;
  android: boolean = false;
  sendPage: any;
  receivePage: any;
  selectedItem: any;
  invitePage: any;
  selectedOption: any;
  conversation: any;
  icons: string[];
  messages: any[] = [];
  items: Array<{ title: string, note: string, icon: string }>;

  constructor( @Inject(ElementRef) elementRef: ElementRef, private nav: NavController,
    navParams: NavParams, public chartData: ChartData, public platform: Platform) {
    this.elementRef = elementRef;
    this.sendPage = SendPage;
    this.receivePage = ReceivePage;
    this.selectedOption = '1W';
    this.invitePage = InvitePage;
    this.conversation = ConversationPage;
    if (this.platform.is('android')) {
      this.android = true;
    }
  }

  ngOnInit() {
  }

  onPageDidEnter() {
    console.log("about to render chart");
    var thisPage = this;
    if (thisPage.chartData.isLoaded) {
      this.filterData();
    } else {
      thisPage.chartData.loadedEmitter.subscribe((_) => {
        console.log("about to render chart");
        this.filterData();
      });
    }
  }

  setRoot(page) {
    this.nav.setRoot(page, {}, { animate: true, direction: 'forward' });
  }

  selected(selectedOption) {
    this.selectedOption = selectedOption;
    this.filterData();
  }

  filterData() {
    let chartPoints = this.chartData.points;
    let startTime = moment().add(-1, 'days');
    switch (this.selectedOption) {
      case '1D':
        startTime = moment().add(-1, 'days');
        break;
      case '1W':
        startTime = moment().add(-7, 'days');
        break;
      case '1M':
        startTime = moment().add(-1, 'months');
        break;
      case '6M':
        startTime = moment().add(-6, 'months');
        break;
      case '1Y':
      default:
        startTime = moment().add(-1, 'years');
        break;
    }
    var priorBalanceRecord = _.filter(chartPoints, function (item) {
      if (moment(item[0]).isAfter(startTime)) {
        return item;
      }
    });
    this.renderChart(priorBalanceRecord);
  }

  renderChart(chartPoints) {
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
        labels: {
          enabled: false
        },
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
          day: '%e-%b'
        },
        tickInterval: 24 * 3600 * 1000, // one day
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
        data: chartPoints,
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

  createAlertPopup() {

    let addressBookModal = Modal.create(AddressBookModal);

    this.nav.present(addressBookModal);
  }

}
