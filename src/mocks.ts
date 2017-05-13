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
