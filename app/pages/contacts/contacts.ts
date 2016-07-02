import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the ContactsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/contacts/contacts.html',
})
export class ContactsPage {
  contacts: any;
  constructor(private nav: NavController) {
    this.populateContacts();
  }

  populateContacts() {
    this.contacts =
      [
        {
          "name": "Jhon Doe",
          "imgID": "1",
          "city": "Thimphu",
          "country": "Bhutan",
          "email": "JhonDoe@gmail.com"
        },
        {
          "name": "Jenny Doe",
          "imgID": "2",
          "city": "Ottawa",
          "country": "Canada",
          "email": "jennyDoe@ur.capital"
        },
        {
          "name": "Rashi Doe",
          "imgID": "3",
          "city": "Beijing",
          "country": "China",
          "email": "rashiDoe@gmail.com"
        },
        {
          "name": "Jon Snow",
          "imgID": "4",
          "city": "Bogota",
          "country": "Colombia",
          "email": "jonSnow@ur.capital"
        },
        {
          "name": "Sansa Stark",
          "imgID": "5",
          "city": "Havana",
          "country": "Cuba",
          "email": "sansaStark@gmail.com"
        },
        {
          "name": "Ramsay Bolton",
          "imgID": "6",
          "city": "Helsinki",
          "country": "Finland",
          "email": "ramsayBolton@ur.capital"
        },
        {
          "name": "Daenerys",
          "imgID": "7",
          "city": "Paris",
          "country": "France",
          "email": "daenerys@gmail.com"
        },
        {
          "name": "Gregor Clegane",
          "imgID": "8",
          "city": "Berlin",
          "country": "Germany",
          "email": "gregorClegane@ur.capital"
        },
        {
          "name": "Khal Drogo",
          "imgID": "9",
          "city": "Ankara",
          "country": "Turkey",
          "email": "khalDrogo@gmail.com"
        },
        {
          "name": "Tyrion Lannister",
          "imgID": "10",
          "city": "Washington, D.C.",
          "country": "United States",
          "email": "tyrionLannister@ur.capital"
        }
      ];
  }
}
