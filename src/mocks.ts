export class NavControllerMock {
  public push(): any {
    return new Promise(function(resolve: Function): void {
      resolve();
    });
  }

  public setRoot(): any {
    return new Promise(function(resolve: Function): void {
      resolve();
    });
  }
}

export class NavParamsMock {
  get(): any { }
}

export class GoogleAnalyticsEventsServiceMock {
  public emitEvent(eventCategory: string, eventAction: string, eventLabel: string = '', eventValue: number = null): void { }

  public emitCurrentPage(pageName: string): void { }
}

export class CountryListServiceMock {
  public getCountryData(): any[] {
    return [
      {
        'telephoneCountryCode': '+93',
        'name': 'Afghanistan',
        'countryCode': 'AF'
      },
      {
        'telephoneCountryCode': '+355',
        'name': 'Albania',
        'countryCode': 'AL'
      },
      {
        'telephoneCountryCode': '+1',
        'name': 'United States',
        'countryCode': 'US'
      }];
  }

  public getDefaultContry(): any {
    return {
      'telephoneCountryCode': '+1',
      'name': 'United States',
      'countryCode': 'US'
    };
  }
}

export class AuthServiceMock {
  public generateHashedPassword(password: string): Promise<string> {
    return Promise.resolve('password');
  }

  public signIn(phone: string, password: string): Promise<string> {
    return Promise.resolve('');
  }

  public requestCheckTempCode(phone: string, tempCode: string): Promise<any> {
    return Promise.resolve('');
  }

  public resetPasswordWithCode(resetCode: string, newPassword: string): Promise<any> {
    return Promise.resolve('');
  }

  public requestChangeTempPassword(phone: string, tempPassword: string): Promise<any> {
    return Promise.resolve('');
  }

  public requestSignIn(phone: string): Promise<any> {
    return new Promise(function(resolve: Function): void {
      resolve();
    });
  }
}

export class ModalControllerMock {
  public create(): any {
    return { present: () => { } };
  }
}

export class LoadingComponentMock {
  present() {
    return new Promise(function(resolve: Function): void {
      resolve();
    });
  }

  dismiss() {
    return new Promise(function(resolve: Function): void {
      resolve();
    });
  }

}
export class LoadingControllerMock {
  component: LoadingComponentMock = new LoadingComponentMock();

  create(): LoadingComponentMock {
    return this.component;
  }
}

export class ToastServiceMock {
  public showMessage(): any {
    return new Promise(function(resolve: Function): void {
      resolve();
    });
  }
}

export class AlertControllerMock {
  public create(): any {
    return { present: () => { } };
  }
}
