import {Injectable, Inject, ViewChild} from '@angular/core'
import {Nav, Platform} from 'ionic-angular';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, AuthMethods} from 'angularfire2'
import * as _ from 'lodash';
import * as log from 'loglevel';
import {Subscription} from 'rxjs';
import {ContactsService} from '../services/contacts-service';
import {Sim} from 'ionic-native';
import {LocalNotifications} from 'ionic-native';

@Injectable()
export class Auth {
  public currentUserId: string
  public currentUserRef: FirebaseObjectObservable<any>;
  public currentUser: any;
  public countryCode: string;
  public androidPlatform: boolean;
  public taskId: string;

  // public authDataProfileImage: any
  // public authDataProfileName: any
  // public authDataProfileDescription: any
  // public authDataProfileEmail: any

  constructor(public angularFire: AngularFire, public contactsService: ContactsService, public platform: Platform) {
    this.androidPlatform = this.platform.is('android');
  }

  respondToAuth(nav: Nav, welcomePage: any, walletSetupPage: any, homePage: any, chatPage) {
    let self = this;
    firebase.auth().onAuthStateChanged((authData) => {
      if (authData) {
        self.currentUserId = authData.uid;
        self.currentUserRef = self.angularFire.database.object(`/users/${self.currentUserId}`);
        let userSubscription: Subscription = self.currentUserRef.subscribe((currentUser) => {
          if (userSubscription && !userSubscription.isUnsubscribed) {
            userSubscription.unsubscribe()
          }
          self.currentUser = currentUser;
          self.getSimCountryCode().then((countryCode) => {
            self.countryCode = countryCode || currentUser.countryCode;
            self.contactsService.load(self.countryCode, self.currentUserId);
          });
          if (currentUser.wallet && currentUser.wallet.address) {
            nav.setRoot(homePage);
            self.processChatNotificationQueue();
            self.listenForNotificationSelection(nav, chatPage);
          } else {
            nav.setRoot(walletSetupPage);
          }
        });
      } else {
        // TODO: turn off all firebase listeners (on, once, subscribe, etc), such as in chat-list.ts and home.ts
        self.currentUserId = undefined;
        self.currentUserRef = undefined;
        self.currentUser = undefined;
        self.countryCode = undefined;
        nav.setRoot(welcomePage);
      }
    });
  }

  listenForNotificationSelection(nav, chatPage) {
    LocalNotifications.on("click", (notification, state) => {
      let data = JSON.parse(notification.data);
      nav.rootNav.push(chatPage, { chatId: data.chatId }, { animate: true, direction: 'forward' });
    });
  }

  requestPhoneVerification(phone: string) {
    let self = this;
    return new Promise((resolve) => {
      let taskRef = firebase.database().ref('/phoneAuthenticationQueue/tasks').push({phone: phone});
      self.taskId = taskRef.key
      taskRef.then((xxx) => {
        log.debug(`task queued to /phoneAuthenticationQueue/tasks/${self.taskId}`);
        let stateRef = taskRef.child("_state");
        stateRef.on('value', (snapshot) => {
          let state = snapshot.val();
          if (state != undefined && state != null && state != "code_generation_in_progress") {
            stateRef.off('value');
            resolve(state);
          }
        });
      });
    });
  }

  checkVerificationCode(submittedVerificationCode: string) {
    let self = this;
    return new Promise((resolve) => {
      let taskRef = firebase.database().ref(`/phoneAuthenticationQueue/tasks/${self.taskId}`);
      taskRef.update({
        submittedVerificationCode: submittedVerificationCode,
        _state: "code_matching_requested" // TODO: add rule that allows only this client-initiated state change
      }).then((xxx) => {
        log.debug(`set submittedVerificationCode to ${submittedVerificationCode} at ${taskRef.toString()}`);
        let verificationResultRef = taskRef.child("verificationResult");
        verificationResultRef.on('value', (snapshot) => {
          let verificationResult = snapshot.val();
          if (verificationResult == undefined) {
            return;
          }
          verificationResultRef.off('value');
          if (verificationResult.error) {
            resolve({ error: verificationResult.error });
          } else if (verificationResult.codeMatch) {
            log.debug('Submitted verification code was correct.');
            firebase.auth().signInWithCustomToken(verificationResult.authToken).then((authData) => {
              log.debug('Authentication succeded!');
              resolve({codeMatch: true});
              taskRef.remove();
            }).catch((error) => {
              log.warn('Authentication failed!');
              taskRef.update({authenticationError: error});
              resolve({error: "Authentication failed"});
              resolve(false);
            });
          } else {
            log.debug('Submitted verification code was not correct.');
            resolve({codeMatch: false});
            taskRef.remove();
          }
        });
      });
    });
  }

  isSignedIn() {
    return !!this.currentUser;
  }

  processChatNotificationQueue() {
    let self = this;
    // TODO: fix this to use firebase-queue later
    // let Queue = require('firebase-queue');
    // let queueRef = firebase.database().ref(`/users/${this.currentUserId}/notificationQueue`);
    // let options = { 'numWorkers': 1 };
    // let queue = new Queue(queueRef, options, (notificationTask: any, progress: any, resolve: any, reject: any) => {
    let notificationTasksRef = firebase.database().ref(`/users/${this.currentUserId}/notificationQueue/tasks`);
    notificationTasksRef.on('child_added', (notificationTaskSnapshot: firebase.database.DataSnapshot) => {
      let notificationTask = notificationTaskSnapshot.val();
      LocalNotifications.schedule({
        id: 1,
        text: `${notificationTask.senderName}: ${notificationTask.text}`,
        icon: 'res://icon',
        smallIcon: 'stat_notify_chat',
        sound: `file://sounds/${self.androidPlatform ? 'messageSound.mp3' : 'messageSound.m4r'}`,
        data: { chatId: notificationTask.chatId }
      });
      notificationTaskSnapshot.ref.remove();
    });
    //   LocalNotifications.schedule({
    //     id: 1,
    //     text: `${notificationTask.senderName}: ${notificationTask.text}`,
    //     icon: 'res://icon',
    //     smallIcon: 'stat_notify_chat',
    //     sound: `file://sounds/${self.androidPlatform ? 'messageSound.mp3' : 'messageSound.m4r'}`,
    //     data: { chatId: notificationTask.chatId }
    //   });
    //   resolve(notificationTask);
    // });
  }

  private getSimCountryCode(): Promise<string> {
    return new Promise((resolve, reject) => {
      Sim.getSimInfo().then((info) => {
        resolve(info.countryCode.toUpperCase());
      }, (error) => {
        log.debug("unable to get country code from sim", error);
        resolve(undefined);
      });
    });
  }

}
