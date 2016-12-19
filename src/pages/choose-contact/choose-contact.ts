import { Component} from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-choose-contact',
  templateUrl: 'choose-contact.html'
})
export class ChooseContactPage {
  option: string = 'contact';
  addressText: string;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController) { }

  ionViewDidLoad() {

  }

  dismissWalletAddress() {
    let data = { walletAddress: this.addressText };
    this.viewCtrl.dismiss(data);
  }

  onContactSelected(contact) {
    this.viewCtrl.dismiss(contact);
  }

}
