import { Component } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../validators/custom';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

@Component({
  selector: 'page-choose-contact',
  templateUrl: 'choose-contact.html'
})
export class ChooseContactPage {
  option: string = 'contact';
  addressText: string;
  mainForm: FormGroup;
  pageName = 'ChooseContactPage';

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, params: NavParams,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    let addr = params.get('walletAddress');
    if (addr) {
      this.addressText = addr;
    }

    this.mainForm = new FormGroup({
      addressWallet: new FormControl('', [Validators.required, CustomValidator.validateAddressField]),
    });
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  incorrectToField(): boolean {
    let control = this.mainForm.get('addressWallet');
    return (control.touched || control.dirty) && control.hasError('invalidAddress');
  }

  dismissWalletAddress() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Choose contact. Dismiss wallet', 'dismissWalletAddress()');
    let data = { walletAddress: (<FormControl>this.mainForm.get('addressWallet')).value };
    this.viewCtrl.dismiss(data);
  }

  onContactSelected(contact) {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Choose contact', 'onContactSelected()');
    this.viewCtrl.dismiss(contact);
  }

}
