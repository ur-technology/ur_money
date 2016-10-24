import {FirebaseModel} from './firebase-model';

export class ChatModel extends FirebaseModel {
  messages: Object[];

  constructor(public _containerPath: string, fieldValues: Object) {
    super(_containerPath, fieldValues);
    // do stuff here
  }

}
