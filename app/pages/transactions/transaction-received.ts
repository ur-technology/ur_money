import {Page, NavController} from 'ionic-angular';

/*
  Generated class for the TransactionsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
    templateUrl: 'build/pages/transactions/transaction-received.html',
})
export class TransactionsReceivedPage {
    transactionData: any;
    constructor(public nav: NavController) {
        this.transactionData = [
            {
                "name": "Jhon Doe",
                "imgID": "1",
                "message": "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters,",
                "date": "04 july 2016",
                "time": "10:30 pm",
                "earnedUR": "1500"
            },
            {
                "name": "Jenny Doe",
                "imgID": "2",
                "message": "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters,",
                "date": "02 july 2016",
                "time": "03:30 pm",
                "earnedUR": "2000"
            },
            {
                "name": "Khal Drogo",
                "imgID": "1",
                "message": "It is a long established fact that a reader",
                "date": "28 june 2016",
                "time": "10:30 pm",
                "earnedUR": "1500"
            },
            {
                "name": "Tyrion Lannister",
                "imgID": "2",
                "message": "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters,",
                "date": "25 june 2016",
                "time": "10:30 pm",
                "earnedUR": "1800"
            },
            {
                "name": "Gregor Clegane",
                "imgID": "1",
                "message": "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters,",
                "date": "22 june 2016",
                "time": "10:30 pm",
                "earnedUR": "1300"
            },
            {
                "name": "Daenerys",
                "imgID": "2",
                "message": "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters,",
                "date": "18 june 2016",
                "time": "10:30 pm",
                "earnedUR": "1400"
            },
            {
                "name": "Ramsay Bolton",
                "imgID": "1",
                "message": "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters,",
                "date": "09 june 2016",
                "time": "10:30 pm",
                "earnedUR": "2500"
            },
            {
                "name": "Sansa Stark",
                "imgID": "2",
                "message": "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters,",
                "date": "05 june 2016",
                "time": "10:30 pm",
                "earnedUR": "1000"
            },
            {
                "name": "Jon Snow",
                "imgID": "1",
                "message": "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters,",
                "date": "06 june 2016",
                "time": "10:30 pm",
                "earnedUR": "1100"
            },
            {
                "name": "Rashi Doe",
                "imgID": "2",
                "message": "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters,",
                "date": "04 june 2016",
                "time": "10:30 pm",
                "earnedUR": "1200"
            }
        ];
    }


}
