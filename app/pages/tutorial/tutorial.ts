import {Page, NavController} from 'ionic-angular';

import {HomePage} from '../home/home';

/*
  Generated class for the TutorialPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/tutorial/tutorial.html',
})
export class TutorialPage {
  slides: any[] = [];
  constructor(public nav: NavController) {
    this.slides = [
      {
        title: "Welcome to <b>UR Money</b>",
        description: "The <b>UR Money App</b> is a practical preview of the Ionic Framework in action, and a demonstration of proper code use.",
        image: "img/ica-slidebox-img-1.png",
      },
      {
        title: "What is UR Money?",
        description: "<b>UR Money</b> is an open source SDK that enables developers to build high quality mobile apps with web technologies like HTML, CSS, and JavaScript.",
        image: "img/ica-slidebox-img-2.png",
      },
      {
        title: " What is UR Money Platform?",
        description: "The <b>UR Money</b> is a cloud platform for managing and scaling Ionic apps with integrated services like push notifications, native builds, user auth, and live updating.",
        image: "img/ica-slidebox-img-3.png",
      }
    ];
  }

  startApp() {
    this.nav.setRoot(HomePage);
  }
}
