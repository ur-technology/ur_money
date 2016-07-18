import { Injectable, Pipe } from '@angular/core';
import * as _ from 'lodash';
/*
  Generated class for the ContactOrderPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'contactOrderPipe'
})
@Injectable()
export class ContactOrderPipe {

  transform(array: any[], args: any[]) {
    if (array) {
      let alreadyInvitedContact = _.filter(array, { 'newUser': true });
      let contactRequiredInvite = _.filter(array, { 'newUser': false });
      let returnContacts = [];
      _.each(_.concat(_.orderBy(alreadyInvitedContact, 'name'), _.orderBy(contactRequiredInvite, 'name')), (contact) => {
        if (args) {
          if (args[0] === 'sms' || args[0] === 'whatsapp') {
            if (contact.phone) {
              returnContacts.push(contact);
            }
          }
          if (args[0] === 'email') {
            if (contact.email) {
              returnContacts.push(contact);
            }
          }
        }
      });
      return returnContacts;
    }
    return [];
  }
}
