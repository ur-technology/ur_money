import * as firebase from 'firebase';

export class FirebaseModel {
  public key: string;

  static ref(containerPath: string): firebase.database.Reference {
    return firebase.database().ref(containerPath);
  }

  fillFields(fieldValues: Object, options?: any) {
    for (let fieldName of Object.getOwnPropertyNames(fieldValues)) {
      if (options && options.branch) {
        this[options.branch][fieldName] = fieldValues[fieldName];
      } else {
        this[fieldName] = fieldValues[fieldName];
      }
    }

  }

  referenceByKey(containerPath: string, key: string): firebase.database.Reference {
    return firebase.database().ref(`${containerPath}/${key}`);
  }

  static getValueOfQueryLocation(queryLocation: string, field: string): firebase.Promise<any> {
    return firebase.database().ref(`${queryLocation}/${field}`).once('value');
  }

  static getObjectWithSpecificFields(queryLocation: string, fields: string[]): Promise<any> {
    return new Promise((successCallback, rejectCallback) => {
      let resultObject: any = {}
      let promises: firebase.Promise<any>[] = [];
      for (let field of fields) {
        let promise = FirebaseModel.getValueOfQueryLocation(queryLocation, field).then(snapshot => {
          if (snapshot.exists()) {
            resultObject[field] = snapshot.val();
          }
        });
        promises.push(promise);
      }
      Promise.all(promises).then(values => {
        successCallback(resultObject);
      });
    });
  }

  update(containerPath: string, newValues: Object): firebase.Promise<any> {
    return firebase.database().ref(containerPath).update(newValues);
  }
}
