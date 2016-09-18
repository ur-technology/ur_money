import {AngularFire, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import * as _ from 'lodash';
import * as firebase from 'firebase';

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

  static all(containerPath, key: string): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      FirebaseModel.referenceByKey(containerPath, key).once('value', (snapshot) => {
        let allValues = snapshot.val();
        _.each(allValues, function(value, key) {
          value.key = key;
        });
        resolve(allValues);
      })
    });
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

  static fieldsExcludedFromSaving(): Array<string> {
    // Fields beginning with "_" will be excluded automatically.
    // To exclude additional fields, override this method in subclass.
    return [];
  }

  constructor(public _containerPath: string, fieldValues: Object) {
    for (let fieldName of Object.getOwnPropertyNames(fieldValues))
    {
      this[fieldName] = fieldValues[fieldName];
    }
    for (let fieldName of Object.getOwnPropertyNames(this)) {
      if (/[\w]At$/.test(fieldName) && this[fieldName] == undefined) {
        this[fieldName] = firebase.database.ServerValue.TIMESTAMP;
      }
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
        self.reference().update(self.saveableValues()).then((_) => {
          resolve(self.key);
        });
      } else {
        let promise = FirebaseModel.reference(self._containerPath).push(self.saveableValues());
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

  static referenceByKey(containerPath, key) {
    return firebase.database().ref(`${containerPath}/${key}`);
  }

  private saveableValues(object?: Object): Object {
    let excludedFields = object ? [] : (this.constructor as any).fieldsExcludedFromSaving();
    if (!object) {
      object = this;
    }
    object = _.omitBy(object, (value, fieldName) => {
      return value == undefined ||
        /^_/.test(fieldName) ||
        fieldName == 'key' ||
        fieldName == '$key' ||
        _.includes(excludedFields, fieldName) ||
        value instanceof Function;
    });
    _.each(object, (value, fieldName) => {
      if (value instanceof Object) {
        object[fieldName] = this.saveableValues(object[fieldName]);
      }
    });
    return object;
  }
}
