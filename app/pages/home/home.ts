import {Page, NavController, NavParams, Alert, Modal, Platform} from 'ionic-angular';
import {ChartDataService} from '../../services/chart-data';
import {Component, OnInit, ElementRef, Inject, ViewChild} from '@angular/core';
import {OrderBy}  from '../../pipes/orderBy';
import {Timestamp}  from '../../pipes/timestamp';
import {RequestPage} from '../request/request';
import {SendPage} from '../send/send';
import {ContactsAndChatsPage} from '../contacts-and-chats/contacts-and-chats';
import {ContactsPage} from '../contacts/contacts';
import {ChatPage} from '../chat/chat';
import * as _ from 'lodash';
import * as moment from 'moment';
import {Round} from '../../pipes/round';
import {ChatListComponent} from '../../components/chat-list/chat-list';
import {LocalNotifications} from 'ionic-native';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {AuthService} from '../../services/auth';
import {UserModel} from '../../models/user';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/home/home.html',
  pipes: [OrderBy, Timestamp, Round],
  directives: [ChatListComponent]
})
export class HomePage {
  elementRef: ElementRef;
  android: boolean;

  constructor( @Inject(ElementRef) elementRef: ElementRef, private nav: NavController,
    navParams: NavParams, public chartData: ChartDataService, public platform: Platform,
    private angularFire: AngularFire, private auth: AuthService) {
    this.elementRef = elementRef;
    this.android = this.platform.is('android');
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
    this.nav.rootNav.push(ContactsAndChatsPage, { goal: "chat" }, { animate: true, direction: 'forward' });
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
    this.nav.push(ContactsAndChatsPage, { goal: "send" }, { animate: true, direction: 'forward' });
  }

  request() {
    this.nav.push(ContactsAndChatsPage, { goal: "request" }, { animate: true, direction: 'forward' });
  }

  invite() {
    this.nav.push(ContactsAndChatsPage, { goal: "invite" }, { animate: true, direction: 'forward' });
  }
}
