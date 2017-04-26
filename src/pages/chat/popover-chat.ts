import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  template: `
    <ion-list>
    <ion-row>
      <ion-col>
        <button ion-item (click)="blockUser()">Block user</button>
      </ion-col>
    </ion-row>
    </ion-list>
  `
})
export class PopoverChatPage {
  constructor(public viewCtrl: ViewController) { }

  blockUser() {
    this.viewCtrl.dismiss({ block: true });
  }
}
