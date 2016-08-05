import {FirebaseModel} from './firebase-model';
import * as _ from 'lodash';

export class ChatSummaryModel extends FirebaseModel {
  createdAt: string;
  // xxx

  constructor(public _containerPath: string, fieldValues: Object) {
    super(_containerPath, fieldValues);
    // do stuff here
  }

}
