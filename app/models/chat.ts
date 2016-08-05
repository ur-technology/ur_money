import {FirebaseModel} from './firebase-model';
import * as _ from 'lodash';

export class ChatModel extends FirebaseModel {
  messages: Object[];

  constructor(public _containerPath: string, fieldValues: Object) {
    super(_containerPath, fieldValues);
    // do stuff here
  }

}
