import {FirebaseModel} from './firebase-model';

export class ChatSummaryModel extends FirebaseModel {
  createdAt: string;

  constructor(public _containerPath: string, fieldValues: Object) {
    super(_containerPath, fieldValues);
    // do stuff here
  }

}
