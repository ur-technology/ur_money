import { Component } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../validators/custom';

@Component({
  selector: 'page-choose-contact',
  templateUrl: 'choose-contact.html'
})
export class ChooseContactPage {
  option: string = 'contact';
  addressText: string;
  mainForm: FormGroup;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, params: NavParams) {
    let addr = params.get('walletAddress');
    if (addr) {
      this.addressText = addr;
    }

    this.mainForm = new FormGroup({
      addressWallet: new FormControl('', [Validators.required, CustomValidator.validateAddressField]),
    });
  }

  ionViewDidLoad() {

  }

  incorrectToField(): boolean {
    let control = this.mainForm.get('addressWallet');
    return (control.touched || control.dirty) && control.hasError('invalidAddress');
  }

  dismissWalletAddress() {
    let data = { walletAddress: (<FormControl>this.mainForm.get('addressWallet')).value };
    this.viewCtrl.dismiss(data);
  }

  onContactSelected(contact) {
    this.viewCtrl.dismiss(contact);
  }

}
