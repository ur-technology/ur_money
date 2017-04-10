import * as moment from 'moment';
import * as _ from 'lodash';
import { ElementRef, Inject, Component, trigger, state, style, transition, animate } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { NavController, NavParams, Platform, AlertController, LoadingController } from 'ionic-angular';
import  Decimal  from 'decimal.js';

import { Config } from '../../config/config';
import { AuthService } from '../../services/auth';
import { ChartDataService } from '../../services/chart-data.service';
import { ToastService } from '../../services/toast';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Utils } from '../../services/utils';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

import { AnnouncementInitiatedPage } from '../announcement-initiated/announcement-initiated';
import { ContactsAndChatsPage } from '../contacts-and-chats/contacts-and-chats';
import { InviteLinkPage } from './../invite-link/invite-link';
import { SendPage } from './../send/send';
import { SponsorWaitPage } from '../sponsor-wait/sponsor-wait';
import { TransactionsPage } from './../transactions/transactions';

declare var jQuery: any;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html',
  animations: [
    trigger('fadeIn', [
      state('inactive, void',
        style({ opacity: 0 })),
      state('active',
        style({ opacity: 1 })),
      transition('inactive => active', [
        animate(1000)
      ])
    ])
  ]
})
export class HomePage {
  elementRef: ElementRef;
  sendButtonHidden: boolean;
  needsToCompleteProfile: boolean;
  balanceTitle: string;
  balanceValue: any = new Decimal(0);
  selectedOption: any;
  balanceChangeUR: any;
  balanceChangePercent: any;
  fadeInState = 'inactive';
  showBonusRewardModal: boolean = false;
  params: any;
  pageName = 'HomePage';

  constructor(
    @Inject(ElementRef) elementRef: ElementRef,
    navParams: NavParams,
    public nav: NavController,
    public platform: Platform,
    private loadingController: LoadingController,
    public angularFire: AngularFire,
    public auth: AuthService,
    public chartData: ChartDataService,
    public toast: ToastService,
    public translate: TranslateService,
    private alertCtrl: AlertController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.elementRef = elementRef;
    this.sendButtonHidden = Config.targetPlatform === 'ios';
    this.params = Utils.queryParams();
  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidEnter()');
    //this.showEmailVerifyNotification();
    this.renderChart();
    this.auth.walletChanged.subscribe(() => {
      this.setBalanceValues();
    });
    this.auth.walletChanged.emit({});
    this.chartData.pointsLoadedEmitter.subscribe(() => {
      this.setBalanceValues();
      this.renderChart();
    });

    setTimeout(() => {
      if (this.auth.currentUser.showBonusConfirmedCallToAction) {
        this.fadeInState = 'active';
        this.showBonusRewardModal = true;
      }
    }, 1500);
  }

  sendVerificationEmail() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on Send verification email button', 'sendVerificationEmail()');
    let loadingModal = this.loadingController.create({ content: this.translate.instant('pleaseWait') });

    loadingModal
      .present()
      .then(() => {
        return this.auth.sendVerificationEmail(
          this.auth.currentUser.phone,
          this.auth.currentUser.email
        );
      })
      .then((taskState: string) => {
        loadingModal
          .dismiss()
          .then(() => {
            switch (taskState) {
              case 'send_verification_email_finished':
                this.googleAnalyticsEventsService.emitEvent(this.pageName, 'send_verification_email_finished', 'sendVerificationEmail()');
                this.toast.showMessage({ messageKey: 'verify-email.verifyEmailSent' });
                break;
              case 'send_verification_email_canceled_because_user_not_found':
                this.googleAnalyticsEventsService.emitEvent(this.pageName, 'send_verification_email_canceled_because_user_not_found', 'sendVerificationEmail()');
                this.toast.showMessage({ messageKey: 'errors.emailNotFound' });
                break;
              case 'send_verification_email_canceled_because_user_disabled':
                this.googleAnalyticsEventsService.emitEvent(this.pageName, 'send_verification_email_canceled_because_user_disabled', 'sendVerificationEmail()');
                this.toast.showMessage({ messageKey: 'errors.userDisabled' });
                break;
              default:
                this.googleAnalyticsEventsService.emitEvent(this.pageName, '', 'sendVerificationEmail()');
                this.toast.showMessage({ messageKey: 'errors.unexpectedProblem' });
            }
          });
      }, (error) => {
        loadingModal
          .dismiss()
          .then(() => {
            this.toast.showMessage({ messageKey: 'errors.unexpectedProblem' });
          });
      });
  }

  private setBalanceValues() {
    if (this.auth.announcementConfirmed()) {
      this.balanceValue = this.auth.currentBalanceUR();
      this.balanceTitle = null;
    } else {
      this.balanceValue = new Decimal(2000);
      this.balanceTitle = this.translate.instant(
        {
          'waiting-for-sponsor': 'home.waitingForSponsor',
          'disabled': 'home.userDisabled'
        }[this.auth.getUserStatus()] || 'home.bonusGenerating'
      );
    }
    if (this.auth.announcementConfirmed() && this.chartData.pointsLoaded) {
      let firstTransaction = _.first(this.chartData.transactionsWithinTimeRange());
      let startingBalanceWei = this.chartData.priorBalanceWei || new Decimal(firstTransaction ? firstTransaction.balance : 0);
      let balanceChangeWei = this.auth.currentBalanceWei().minus(startingBalanceWei);
      this.balanceChangeUR = balanceChangeWei.dividedBy(1000000000000000000).round(0, Decimal.ROUND_HALF_FLOOR);
      this.balanceChangePercent = startingBalanceWei.isZero() ? null : balanceChangeWei.times(100).dividedBy(startingBalanceWei).round(0, Decimal.ROUND_HALF_FLOOR);
    } else {
      this.balanceChangeUR = null;
      this.balanceChangePercent = null;
    }
  }

  startNewChat() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'clicked on plus button on home', 'startNewChat()');
    this.nav.push(ContactsAndChatsPage, { goal: 'chat' });
  }

  setRoot(page) {
    this.nav.setRoot(page, {});
  }

  loadChartPoints(duration: number, unitOfTime: moment.UnitOfTime) {
    this.chartData.loadPointsAndCalculateMetaData(duration, unitOfTime);
  }

  renderChart() {
    if (!this.chartData.pointsLoaded) {
      return;
    }
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
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'send()', 'clicked on send button on home');
    this.nav.push(SendPage, { contact: {} });
  }

  invite() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'clicked on invite button on home', 'invite()');
    if (!this.auth.announcementConfirmed()) {
      let alert = this.alertCtrl.create({
        subTitle: this.translate.instant('home.noInvitesAllowed'),
        buttons: [this.translate.instant('dismiss')]
      });
      alert.present();
    } else {
      if (Config.targetPlatform === 'web') {
        this.nav.push(InviteLinkPage);
      } else {
        this.nav.push(ContactsAndChatsPage, { goal: 'invite' });
      }
    }
  }

  hideModalAndInviteFriends() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(this.pageName, 'dismissed modal animation that shows when bonus has been approved', 'hideModalAndInviteFriends()');
    self.auth.currentUser.update({ showBonusConfirmedCallToAction: null }).then(() => {
      self.auth.currentUser.showBonusConfirmedCallToAction = false;
      self.showBonusRewardModal = false;
      self.invite();
    })

  }

  accountReady() {
    return this.auth.getUserStatus() === 'announcement-confirmed';
  }

  goToNextStep() {

    if (this.accountReady()) {
      this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on 2000 UR sign. Account ready', 'goToNextStep()');
      this.nav.push(TransactionsPage);
    } else {
      this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on 2000 UR sign.', 'goToNextStep()');
      this.nav.push({
        'announcement-initiated': AnnouncementInitiatedPage,
        'announcement-requested': AnnouncementInitiatedPage,
        'announcement-confirmed': AnnouncementInitiatedPage,
        'waiting-for-sponsor': SponsorWaitPage
      }[this.auth.getUserStatus()] || AnnouncementInitiatedPage);
    }
  }

  envModeDisplay() {
    return Utils.envModeDisplay();
  }

}
