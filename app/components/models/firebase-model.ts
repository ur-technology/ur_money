import {AngularFire, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';

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

  save(): void {
    if (this.key) {
      this.observable().update(this.valuesToSave());
    } else {
      this.key = FirebaseModel.observable(this._containerPath).push(this.valuesToSave()).key
    }
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

  private angularFire() {
    return FirebaseModel._angularFire;
  }

  private valuesToSave(): Object {
    let values = {};
    for (let fieldName of Object.getOwnPropertyNames(this)) {
      let excludedFields = (this.constructor as any).fieldsExcludedFromSaving();
      excludedFields.push("key");
      if (!/^_/.test(fieldName) && excludedFields.indexOf(fieldName) == -1 && this[fieldName] != undefined) {
        values[fieldName] = this[fieldName];
      }
    }
    return values;
  }


}
