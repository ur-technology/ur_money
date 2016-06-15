import {Page, NavController, NavParams, Alert, Modal} from 'ionic-angular';
import {ChartData} from '../../components/chart-data/chart-data';
import {Component, OnInit, ElementRef, Inject} from '@angular/core';
import {OrderBy}  from '../../pipes/orderBy';
import {Timestamp}  from '../../pipes/timestamp';
import {AddressBookModal} from '../../components/address-book-modal/address-book-modal';
import {ReceivePage} from '../receive/receive';
import {SendPage} from '../send/send';
import {InvitePage} from '../invite/invite';
import * as _ from 'lodash';
import * as moment from 'moment';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/home/home.html',
  pipes: [OrderBy, Timestamp]
})
export class HomePage implements OnInit {
  elementRef: ElementRef;
  sendPage: any;
  receivePage: any;
  selectedItem: any;
  invitePage: any;
  icons: string[];
  messages: any[] = [];
  items: Array<{ title: string, note: string, icon: string }>;

  constructor( @Inject(ElementRef) elementRef: ElementRef, private nav: NavController,
    navParams: NavParams, public chartData: ChartData) {
    this.elementRef = elementRef;
    this.sendPage = SendPage;
    this.receivePage = ReceivePage;
    this.invitePage = InvitePage;
  }

  ngOnInit() {
  }

  onPageDidEnter() {
    console.log("about to render chart");
    var thisPage = this;
    if (thisPage.chartData.isLoaded) {
      thisPage.renderChart();
    } else {
      thisPage.chartData.loadedEmitter.subscribe((_) => {
        console.log("about to render chart");
        thisPage.renderChart();
      });
    }
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
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
          day: '%e-%b'
        },
        tickInterval: 24 * 3600 * 1000, // one day
        // title: {
        //     text: 'Date'
        // }
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

  createAlertPopup() {

    let addressBookModal = Modal.create(AddressBookModal);

    this.nav.present(addressBookModal);
  }

}
