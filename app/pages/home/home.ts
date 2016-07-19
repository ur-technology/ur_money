import {Page, NavController, NavParams, Alert, Modal, Platform} from 'ionic-angular';
import {ChartData} from '../../components/chart-data/chart-data';
import {Component, OnInit, ElementRef, Inject, ViewChild} from '@angular/core';
import {OrderBy}  from '../../pipes/orderBy';
import {Timestamp}  from '../../pipes/timestamp';
import {AddressBookModal} from '../../components/address-book-modal/address-book-modal';
import {ReceivePage} from '../receive/receive';
import {SendPage} from '../send/send';
import {InvitePage} from '../invite/invite';
import {ContactsAndChatsPage} from '../contacts-and-chats/contacts-and-chats';
import * as _ from 'lodash';
import * as underscore from 'underscore'
import * as moment from 'moment';
import {Round} from '../../pipes/round';
import {ChatSummaries} from '../../components/chat-summaries/chat-summaries';
import {LocalNotifications} from 'ionic-native';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {Auth} from '../../components/auth/auth';
import {User2} from '../../components/models/user2';

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
  icons: string[];
  messages: any[] = [];
  items: Array<{ title: string, note: string, icon: string }>;
  @ViewChild(ChatSummaries) chatSummaries: ChatSummaries;

  constructor( @Inject(ElementRef) elementRef: ElementRef, private nav: NavController,
    navParams: NavParams, public chartData: ChartData, public platform: Platform, private angularFire: AngularFire, private auth: Auth) {
    this.elementRef = elementRef;
    this.sendPage = SendPage;
    this.receivePage = ReceivePage;
    this.selectedOption = '1W';
    this.invitePage = InvitePage;
    if (this.platform.is('android')) {
      this.android = true;
    }

    // create new user
    let user = new User2("/users", {firstName: "Jack", lastName: "Black"});
    user.save().then((key) => {
      console.log("step 1: user saved with key", key, ", also stored in user as ", user.key);

      // now look up same user
      User2.find("/users", user.key).then((user) => {
        console.log("step 2: looked up user with key ", user.key, ", firstName ", user.firstName);

        // update user
        user.firstName = "George";
        user.save();
        console.log("step 3: saved user, set firstName to", user.firstName);

        // look him up again
        User2.find("/users", user.key).then((user) => {
          console.log("step 4: looked up user again, now first name is", user.firstName);
        });

      });
    });

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
    }
    thisPage.chartData.loadedEmitter.subscribe((data) => {
      this.renderChart();
    });
    this.sendMessageNotifications();
  }

  openChatsPage() {
    this.nav.push(ContactsAndChatsPage, {}, { animate: true, direction: 'forward' });
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

  sendMessageNotifications() {
    this.angularFire.database.list(`/notifications`, {
      query: {
        orderByChild: "receiverUid",
        equalTo: this.auth.uid
      }
    }).subscribe((data: any) => {
      if (data) {
        this.scheduleNotification(data, this.auth.uid);
      }
    });
  }

  private scheduleNotification(data: any, userId: string) {
    for (var i = 0; i < data.length; i++) {
      if (userId === data[i].receiverUid) {
        LocalNotifications.schedule({
          id: data[i].$key,
          text: `${data[i].senderName}: ${data[i].text}`,
          icon: 'res://icon',
          smallIcon: 'stat_notify_chat'
        });
        this.angularFire.database.object(`/notifications/${data[i].$key}`).remove();
      }
    }
  }
}
