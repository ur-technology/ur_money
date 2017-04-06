import {Injectable} from "@angular/core";
import {AuthService} from './auth';

@Injectable()
export class GoogleAnalyticsEventsService {
  constructor(private auth: AuthService) {

  }

  public emitEvent(eventCategory: string, eventAction: string, eventLabel: string = '', eventValue: number = null) {
    let userId = this.auth.currentUser ? this.auth.currentUser.key : 'No user ID';
    ga('send', 'event', {
      eventCategory: eventCategory,
      eventLabel: `UserId: ${userId} - ${eventLabel}`,
      eventAction: `${eventCategory} - ${eventAction}`,
      eventValue: eventValue
    });
  }
}
