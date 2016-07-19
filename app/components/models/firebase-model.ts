import {AngularFire, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import * as _ from 'lodash';

export class FirebaseModel {
  private static _angularFire: AngularFire;
  public key: string;

  static init(angularFire) {
    FirebaseModel._angularFire = angularFire;
  }

  static observable(containerPath: string): FirebaseListObservable<any> {
    return FirebaseModel._angularFire.database.list(containerPath);
  }

  static reference(containerPath: string): firebase.database.Reference {
    return firebase.database().ref(containerPath);
  }

  static find(containerPath, key: string): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      FirebaseModel.referenceByKey(containerPath, key).once('value', (snapshot) => {
        let fieldValues = snapshot.val();
        let instance = new self(containerPath, fieldValues);
        instance.key = snapshot.key;
        resolve(instance);
      })
    });
  }

  constructor(public _containerPath: string, fieldValues: Object) {
    for (let fieldName of Object.getOwnPropertyNames(fieldValues))
    {
      this[fieldName] = fieldValues[fieldName];
    }
  }

  observable() {
    return this.key ? FirebaseModel._angularFire.database.object(`${this._containerPath}/${this.key}`) : undefined;
  }

  reference(): firebase.database.Reference {
    return this.key ? FirebaseModel.referenceByKey(this._containerPath, this.key) : undefined;
  }

  save(): Promise<FirebaseModel> {
    return new Promise((resolve, reject) => {
      let self = this;
      if (self.key) {
        self.reference().update(self.valuesToSave()).then((_) => {
          resolve(self.key);
        });
      } else {
        let promise = FirebaseModel.reference(self._containerPath).push(self.valuesToSave());
        self.key = promise.key;
        promise.then((_) => {
          resolve(self.key);
        });
      }
    });
  }

  //////////////////
  // helper methods
  //////////////////

  static fieldsExcludedFromSaving(): Array<string> {
    // Fields beginning with "_" will be excluded automatically.
    // To exclude additional fields, override this method in subclass.
    return [];
  }

  static referenceByKey(containerPath, key) {
    return firebase.database().ref(`${containerPath}/${key}`);
  }

  private valuesToSave(): Object {
    let excludedFields = (this.constructor as any).fieldsExcludedFromSaving();
    return _.omitBy(this, function(value, fieldName) {
      return value == undefined ||
        /^_/.test(fieldName) ||
        fieldName == 'key' ||
        _.includes(excludedFields, fieldName) ||
        value instanceof Function;
    });
  }


}
