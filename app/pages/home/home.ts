import {Page, NavController, NavParams, Alert, Modal} from 'ionic-angular';
import {Auth} from '../../components/auth/auth';
import {Component, OnInit, ElementRef, Inject} from '@angular/core';
import {HomeService} from './home-service';
import {UserService} from '../../providers/user-service/user-service';
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
  UR: any = { currentBalance: {} };
  URHistoryDate: any[] = [];
  URHistoryAmount: any[] = [];
  messages: any[] = [];
  items: Array<{ title: string, note: string, icon: string }>;

  constructor( @Inject(ElementRef) elementRef: ElementRef, private nav: NavController,
    navParams: NavParams, auth: Auth, public homeService: HomeService, public userService: UserService) {
    this.elementRef = elementRef;

    this.homeService.loadUREmitter.subscribe((data) => {
      this.formatTheResponseFromLoadingUR(data);
    });
  }

  ngOnInit() {

  }

  onPageDidEnter() {
    this.homeService.loadUR().then((data: any) => {
      this.formatTheResponseFromLoadingUR(data);
    });

    this.homeService.loadMessages().then((messages: any) => {
      this.messages = messages;
    });

  }

  formatTheResponseFromLoadingUR(data: any) {
    this.URHistoryDate = [];
    this.URHistoryAmount = [];
    this.UR = data;
    _.forEach(data.balanceHistory, (value, key) => {
      this.URHistoryDate.push(moment(value.updatedAt).fromNow(true));
      this.URHistoryAmount.push(value.amount / 10000);
    });
    console.log(this.URHistoryAmount);
    this.renderChart();
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
            return this.value / 100000;
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
        name: 'Amount',
        data: this.URHistoryAmount
      }]
    });
  }

  createAlertPopup() {
   
    let addressBookModal = Modal.create(AddressBookModal);

    this.nav.present(addressBookModal);
  }

}
