import { Component } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../validators/custom';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';
import { AuthService } from '../../services/auth';
import * as moment from 'moment';

@Component({
  selector: 'page-choose-contact',
  templateUrl: 'choose-contact.html'
})
export class ChooseContactPage {
  option: string = 'search';
  addressText: string;
  mainForm: FormGroup;
  pageName = 'ChooseContactPage';
  userRegisteredForMoreThan90Days: boolean = false;
  showMessageLegacyUsers: boolean = false;
  dateAllowedToSend:any;


  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    params: NavParams,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService,
    private authService: AuthService) {

    this.mainForm = new FormGroup({
      addressWallet: new FormControl('', [Validators.required, CustomValidator.validateWalletAddressField]),
    });
  }

  ngOnInit() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
    this.isUserRegisteredFor90Days();
  }

  incorrectToField(): boolean {
    let control = this.mainForm.get('addressWallet');
    return (control.touched || control.dirty) && control.hasError('invalidAddress');
  }

  dismissWalletAddress() {
    if(!this.userRegisteredForMoreThan90Days){
      return;
    }

    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Choose contact. Dismiss wallet', 'dismissWalletAddress()');
    let data = { walletAddress: (<FormControl>this.mainForm.get('addressWallet')).value };
    this.viewCtrl.dismiss(data);
  }

  onContactSelected(contact) {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Choose contact', 'onContactSelected()');
    this.viewCtrl.dismiss(contact);
  }

  dismissModal() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'No contact chosen', 'dismissModal()');
    this.viewCtrl.dismiss();
  }

  isUserRegisteredFor90Days() {
    let restrictionDateConfig = [2017, 3, 3];//2017 April 3rd
    let restrictionStartDate = moment(restrictionDateConfig);

    let createdAtDate;
    if (restrictionStartDate.isBefore(moment(this.authService.currentUser.createdAt))) {
      createdAtDate =moment(this.authService.currentUser.createdAt);
      this.dateAllowedToSend = moment(createdAtDate).add(90, 'days').format('D/MMM/YYYY');
      this.showMessageLegacyUsers = false;
    } else {
      createdAtDate = moment(restrictionDateConfig);
      this.dateAllowedToSend = moment(createdAtDate).add(90, 'days').format('D/MMM/YYYY');
      this.showMessageLegacyUsers = true;
    }
    let days = moment().diff(createdAtDate, 'days');
    this.userRegisteredForMoreThan90Days = days > 90;
    if(!this.userRegisteredForMoreThan90Days){
      (<FormControl>this.mainForm.get('addressWallet')).disable();
    }
  }
}
