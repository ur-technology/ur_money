import { Component} from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-choose-contact',
  templateUrl: 'choose-contact.html'
})
export class ChooseContactPage {
  option: string = 'contact';
  addressText: string;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, params: NavParams) {
    let addr = params.get('walletAddress');
    if(addr){
      this.addressText = addr;
    }
  }

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
