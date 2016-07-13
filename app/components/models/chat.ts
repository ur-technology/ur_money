import {FirebaseModel} from './firebase-model';
import * as _ from 'lodash';

export class ChatSummary extends FirebaseModel {
  createdAt: string;
  // xxx

  constructor(public _containerPath: string, fieldValues: Object) {
    super(_containerPath, fieldValues);
    // do stuff here
  }

}

export class Chat extends FirebaseModel {
  messages: Object[];

  constructor(public _containerPath: string, fieldValues: Object) {
    super(_containerPath, fieldValues);
    // do stuff here
  }

}
