export class NavMock {
  public push(): any {
    return new Promise(function(resolve: Function): void {
      resolve();
    });
  }
}


export class GoogleAnalyticsEventsServiceMock {
  public emitEvent(eventCategory: string, eventAction: string, eventLabel: string = '', eventValue: number = null): void { }

  public emitCurrentPage(pageName: string): void { }
}

export class CountryListServiceMock {
  public getCountryData(): any[] {
    return[
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

}

export class ModalControllerMock {
  public create(): any {
    return { present: () => { } };
  }
}

export class LoadingControllerMock {

}

export class ToastServiceMock {

}

export class AlertControllerMock {

}
