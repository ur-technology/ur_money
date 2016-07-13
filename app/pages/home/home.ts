import {Page, NavController, NavParams, Alert, Modal, Platform} from 'ionic-angular';
import {ChartData} from '../../components/chart-data/chart-data';
import {Component, OnInit, ElementRef, Inject, ViewChild} from '@angular/core';
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
import {ChatSummaries} from '../../components/chat-summaries/chat-summaries';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/home/home.html',
  pipes: [OrderBy, Timestamp, Round],
  directives: [ChatSummaries]
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
  @ViewChild(ChatSummaries) chatSummaries:ChatSummaries;

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

  onPageWillLeave() {
    this.chatSummaries.cleanResources();
  }
  onPageDidEnter() {
    this.chatSummaries.loadChatSummaries();
    var thisPage = this;
    if (thisPage.chartData.isLoaded) {
      this.renderChart();
    } else {
      thisPage.chartData.loadedEmitter.subscribe((_) => {
        // console.log("about to render chart");
        this.renderChart();
      });
    }
  }

  openChatsPage(){
  this.nav.push(ConversationPage, {}, { animate: true, direction: 'forward' });
}


  setRoot(page) {
    this.nav.setRoot(page, {}, { animate: true, direction: 'forward' });
  }

  selected(selectedOption) {
    this.selectedOption = selectedOption;
    this.chartData.filterBalanceRecords(this.selectedOption);
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

  createAlertPopup() {

    let addressBookModal = Modal.create(AddressBookModal);

    this.nav.present(addressBookModal);
  }

}
