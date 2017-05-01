import {Injectable} from "@angular/core";
import {AuthService} from './auth';

@Injectable()
export class GoogleAnalyticsEventsService {
  constructor(private auth: AuthService) {

  }

  public emitEvent(eventCategory: string, eventAction: string, eventLabel: string = '', eventValue: number = null) {
    let userId = this.auth.currentUser ? this.auth.currentUser.key : 'No user ID';
    let state = this.getUserState();
    ga('send', 'event', {
      eventCategory: eventCategory,
      eventLabel: `UserId: ${userId} - State:${state} - ${eventLabel}`,
      eventAction: `${eventCategory} - ${eventAction}`,
      eventValue: eventValue
    });
  }

  public emitCurrentPage(pageName: string) {
    ga('set', 'page', `/${pageName}`);
    // ga('set', 'title', pageName);
    ga('send', 'pageview');
  }

  private getUserState(): string {
    let u: any = this.auth.currentUser;
    if (!u) {
      return '';
    }

    if (u.disabled) {
      return 'disabled'
    } else if (u.wallet && u.wallet.announcementTransaction && u.wallet.announcementTransaction.hash && u.wallet.announcementTransaction.blockNumber) {
      return 'announcement-confirmed';
    } else if (u.wallet && u.wallet.announcementTransaction && u.wallet.announcementTransaction.hash) {
      return 'waiting-for-announcement-to-be-confirmed';
    } else if (!(u.wallet && u.wallet.address)) {
      return 'missing-wallet';
    } else if (!u.signUpBonusApproved && !(u.idUploaded && u.selfieMatched)) {
      return 'missing-docs';
    } else if (!u.signUpBonusApproved) {
      return 'waiting-for-review';
    } else if (!(u.wallet && u.wallet.address)) {
      return 'missing-wallet';
    } else {
      return 'waiting-for-announcement-to-be-queued';
    }

  }
}
