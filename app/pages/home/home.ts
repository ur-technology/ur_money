import {Page, NavController, NavParams, Alert, Modal, Platform} from 'ionic-angular';
import {ChartData} from '../../services/chart-data';
import {Component, OnInit, ElementRef, Inject, ViewChild} from '@angular/core';
import {OrderBy}  from '../../pipes/orderBy';
import {Timestamp}  from '../../pipes/timestamp';
import {ReceivePage} from '../receive/receive';
import {SendPage} from '../send/send';
import {ContactsAndChatsPage} from '../contacts-and-chats/contacts-and-chats';
import {ContactsPage} from '../contacts/contacts';
import * as _ from 'lodash';
import * as moment from 'moment';
import {Round} from '../../pipes/round';
import {ChatList} from '../../components/chat-list/chat-list';
import {LocalNotifications} from 'ionic-native';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {Auth} from '../../services/auth';
import {User2} from '../../models/user2';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/home/home.html',
  pipes: [OrderBy, Timestamp, Round],
  directives: [ChatList]
})
export class HomePage implements OnInit {
  elementRef: ElementRef;
  android: boolean = false;
  sendPage: any;
  receivePage: any;
  selectedItem: any;
  selectedOption: any;
  icons: string[];
  messages: any[] = [];
  items: Array<{ title: string, note: string, icon: string }>;

  constructor( @Inject(ElementRef) elementRef: ElementRef, private nav: NavController,
    navParams: NavParams, public chartData: ChartData, public platform: Platform,
    private angularFire: AngularFire, private auth: Auth) {
    this.elementRef = elementRef;
    this.sendPage = SendPage;
    this.receivePage = ReceivePage;
    this.selectedOption = '1W';
    if (this.platform.is('android')) {
      this.android = true;
    }
  }

  ngOnInit() {
  }

  onPageDidEnter() {
    var thisPage = this;
    if (thisPage.chartData.isLoaded) {
      this.renderChart();
    }
    thisPage.chartData.loadedEmitter.subscribe((data) => {
      this.renderChart();
    });
    this.sendMessageNotifications();
  }

  startNewChat() {
    this.nav.push(ContactsAndChatsPage, { animate: true, direction: 'forward' });
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

  sendMessageNotifications() {
    this.angularFire.database.list(`/users/${this.auth.currentUserId}/notifications/`).subscribe((data: any) => {
      if (data) {
        this.scheduleNotification(data, this.auth.currentUserId);
      }
    });
  }

  inviteContact() {
    this.nav.rootNav.push(ContactsAndChatsPage, {nonMembersFirst: true}, { animate: true, direction: 'forward' });
  }

  private scheduleNotification(data: any, userId: string) {
    for (var i = 0; i < data.length; i++) {
      LocalNotifications.schedule({
        id: data[i].$key,
        text: `${data[i].senderName}: ${data[i].text}`,
        icon: 'res://icon',
        smallIcon: 'stat_notify_chat'
      });
      this.angularFire.database.object(`/users/${userId}/notifications/${data[i].$key}`).remove();
    }
  }
}
