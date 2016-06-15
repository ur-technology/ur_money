import {Page, NavController, NavParams} from 'ionic-angular';

/*
  Generated class for the TabsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/tabs/tabs.html',
})
export class TabsPage {
  mySelectedIndex: any;
  tab1Root: any;
  tab2Root: any;;
  tab3Root: any;;
  tab4Root: any;;
  constructor(public nav: NavController, public navParams: NavParams) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;

  }
}
