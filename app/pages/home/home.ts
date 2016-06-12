import {Page, NavController, NavParams, Alert, Modal} from 'ionic-angular';
import {ChartData} from '../../components/chart-data/chart-data';
import {Component, OnInit, ElementRef, Inject} from '@angular/core';
import {OrderBy}  from '../../pipes/orderBy';
import {Timestamp}  from '../../pipes/timestamp';
import {AddressBookModal} from '../../components/address-book-modal/address-book-modal';
import * as _ from 'lodash';
import * as moment from 'moment';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/home/home.html',
  pipes: [OrderBy, Timestamp]
})
export class HomePage implements OnInit {
  elementRef: ElementRef;
  selectedItem: any;
  icons: string[];
  messages: any[] = [];
  items: Array<{ title: string, note: string, icon: string }>;

  constructor( @Inject(ElementRef) elementRef: ElementRef, private nav: NavController,
    navParams: NavParams, public chartData: ChartData) {
    this.elementRef = elementRef;
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
        type: 'area'
      },
      title: {
        text: false
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
            month: '%b-%e',
            year: '%b'
        },
        tickInterval: 24 * 3600 * 1000,
        title: {
            text: 'Date'
        }
      },
      yAxis: {
          title: {
              text: 'UR Balance'
          },
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
          // step: 'left'
      }]
            // navigation: {
      //   buttonOptions: {
      //     enabled: false
      //   }
      // },
      //
      // credits: {
      //   enabled: false
      // },
      // chart: {
      //   type: 'area'
      // },
      //
      // title: {
      //   text: ''
      // },
      // xAxis: {
      //   type: 'datetime',
      //   dateTimeLabelFormats: { // don't display the dummy year
      //     month: '%e-%b',
      //     year: '%b'
      //   },
      //   //tickmarkPlacement: 'on', // TODO: check this
      //   title: {
      //     enabled: false
      //   }
      // },
      // yAxis: {
      //   title: {
      //     enabled: false // TODO: check this
      //   },
      //   min: 0
      //   // labels: {
      //   //   formatter: function () {
      //   //     return this.value;
      //   //   }
      //   // }
      // },
      //
      // tooltip: {
      //   pointFormat: '{point.x:%e-%b}: {point.y:.2f} UR'
      // },
      // plotOptions: {
      //   area: {
      //     stacking: 'normal',
      //     lineColor: '#666666',
      //     lineWidth: 1,
      //     marker: {
      //       lineWidth: 1,
      //       lineColor: '#666666'
      //     }
      //   }
      // },
      // series: [{
      //   name: 'Amount',
      //   data: this.chartData.points
      // }]
    });
  }

  createAlertPopup() {

    let addressBookModal = Modal.create(AddressBookModal);

    this.nav.present(addressBookModal);
  }

}
