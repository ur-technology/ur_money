import {Page, NavController, NavParams} from 'ionic-angular';
import {Auth} from '../../components/auth/auth';
import {Component, OnInit, ElementRef, Inject} from '@angular/core';
import {HomeService} from '../../providers/home-service/home-service';
import {OrderBy}  from '../../pipes/orderBy';
import {Timestamp}  from '../../pipes/timestamp';

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
  UR: any = { current_ur_holdings: {} };
  URHistoryDate: any[] = [];
  URHistoryQuantity: any[] = [];
  messages: any[] = [];
  items: Array<{ title: string, note: string, icon: string }>;

  constructor( @Inject(ElementRef) elementRef: ElementRef, private nav: NavController, navParams: NavParams, auth: Auth, public homeService: HomeService) {
    this.elementRef = elementRef;
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
      'american-football', 'boat', 'bluetooth', 'build'];

    this.items = [];
    for (let i = 1; i < 11; i++) {
      this.items.push({
        title: 'Item ' + i,
        note: 'This is item #' + i,
        icon: this.icons[Math.floor(Math.random() * this.icons.length)]
      });
    }

  }

  ngOnInit() {

  }

  onPageDidEnter() {
    this.homeService.loadUR().then((data: any) => {
      this.UR = data;
      _.forEach(data.historical_ur_holdings, (value, key) => {
        this.URHistoryDate.push(moment(value.updatedAt).fromNow(true));
        this.URHistoryQuantity.push(value.quantity);
        this.renderChart();
      });
    });

    this.homeService.loadMessages().then((messages: any) => {
      this.messages = messages;
    });
  }


  renderChart() {
    jQuery(this.elementRef.nativeElement).find('.container').highcharts({
      navigation: {
        buttonOptions: {
          enabled: false
        }
      },

      credits: {
        enabled: false
      },
      chart: {
        type: 'area'
      },

      title: {
        text: ''
      },
      xAxis: {
        categories: this.URHistoryDate,
        tickmarkPlacement: 'on',
        title: {
          enabled: false
        }
      },
      yAxis: {
        title: {
          enabled: false
        },
        labels: {
          formatter: function () {
            return this.value;
          }
        }
      },
      tooltip: {
        shared: true
      },
      plotOptions: {
        area: {
          stacking: 'normal',
          lineColor: '#666666',
          lineWidth: 1,
          marker: {
            lineWidth: 1,
            lineColor: '#666666'
          }
        }
      },
      series: [{
        name: 'Quantity',
        data: this.URHistoryQuantity
      }]
    });
  }

}
