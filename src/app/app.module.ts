import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { UrMoney } from './app.component';
import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';
import {ChatPage} from '../pages/chat/chat';
import {ContactsAndChatsPage} from '../pages/contacts-and-chats/contacts-and-chats';
import {IdentityVerificationFinishPage} from '../pages/identity-verification/identity-verification-finish/identity-verification-finish';
import {IdentityVerificationIntroPage} from '../pages/identity-verification/identity-verification-intro/identity-verification-intro';
import {IdentityVerificationPersonalInfoPage} from '../pages/identity-verification/identity-verification-personal-info/identity-verification-personal-info';
import {IdentityVerificationSponsorWaitPage} from '../pages/identity-verification/identity-verification-sponsor-wait/identity-verification-sponsor-wait';
import {IdentityVerificationSummaryPage} from '../pages/identity-verification/identity-verification-summary/identity-verification-summary';
import {IdentityVerificationAddressPage} from '../pages/identity-verification/identity-verification-address/identity-verification-address';
import {IdentityVerificationDocumentPage} from '../pages/identity-verification/identity-verification-document/identity-verification-document';
import {AnnouncementInitiatedPage} from '../pages/registration/announcement-initiated';
import {AuthenticationCodePage} from '../pages/registration/authentication-code/authentication-code';
import {CountryNotSupportedPage} from '../pages/registration/country-not-supported';
import {EmailAddressPage} from '../pages/registration/email-address';
import {IntroPage} from '../pages/registration/intro/intro';
import {NoInternetConnectionPage} from '../pages/registration/no-internet-connection';
import {PhoneNumberPage} from '../pages/registration/phone-number/phone-number';
import {InviteLinkPage} from '../pages/invite-link/invite-link';
import {ProfileSetupPage} from '../pages/registration/profile-setup/profile-setup';
import {VerificationFailedPage} from '../pages/registration/verification-failed';
import {VerificationPendingPage} from '../pages/registration/verification-pending';
import {PopoverChatPage} from '../pages/chat/popover-chat';
import {WalletSetupPage} from '../pages/registration/wallet-setup/wallet-setup';
import {WelcomePage} from '../pages/registration/welcome/welcome';
import {SendPage} from '../pages/send/send';
import {ChooseContactPage} from '../pages/choose-contact/choose-contact';
import {UsersPage} from '../pages/admin/users';
import {UserPage} from '../pages/admin/user';
import {ChangeSponsorModal} from '../pages/admin/change-sponsor';
import {SettingsPage} from '../pages/settings/settings';
import {TermsAndConditionsPage} from '../pages/terms-and-conditions/terms-and-conditions';
import {TransactionsPage} from '../pages/transactions/transactions';
import {ChatListComponent} from '../components/chat-list/chat-list';
import {ContactsComponent} from '../components/contacts/contacts';
import {EventListComponent} from '../components/event-list/event-list';
import {TransactionComponent} from '../components/transaction/transaction';
import {DateAndTime} from '../pipes/dateAndTime.pipe';
import {FilterPipe} from '../pipes/filterPipe';
import {OrderBy} from '../pipes/orderBy';
import {Round} from '../pipes/round';
import {Timestamp} from '../pipes/timestamp';
import {AuthService} from '../services/auth';
import {ChartDataService} from '../services/chart-data';
import {ContactsService} from '../services/contacts';
import {CountryListService} from '../services/country-list';
import {EncryptionService} from '../services/encryption';
import {EventsService} from '../services/events';
import {ToastService} from '../services/toast';
import {KeyboardAttachDirective} from '../directives/keyboard-attach.directive';
import {TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import {Http, HttpModule} from '@angular/http';
import {BrowserModule} from "@angular/platform-browser";
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import { FormsModule } from '@angular/forms';
import {Config} from '../config/config';


export const firebaseConfig = {
  apiKey: Config.firebaseApiKey,
  authDomain: Config.firebaseProjectId + '.firebaseapp.com',
  databaseURL: 'https://' + Config.firebaseProjectId + '.firebaseio.com',
  storageBucket: Config.firebaseProjectId + '.appspot.com'
};

const myFirebaseAuthConfig = {
  provider: AuthProviders.Custom,
  method: AuthMethods.CustomToken
}

export function translateLoaderFactory(http: any) {
return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}

@NgModule({
  declarations: [
    UrMoney,
    AboutPage,
    HomePage,
    ChatPage,
    PopoverChatPage,
    ContactsAndChatsPage,
    IdentityVerificationFinishPage,
    IdentityVerificationIntroPage,
    IdentityVerificationPersonalInfoPage,
    IdentityVerificationSponsorWaitPage,
    IdentityVerificationDocumentPage,
    IdentityVerificationSummaryPage,
    IdentityVerificationAddressPage,
    InviteLinkPage,
    AnnouncementInitiatedPage,
    CountryNotSupportedPage,
    AuthenticationCodePage,
    EmailAddressPage,
    IntroPage,
    NoInternetConnectionPage,
    PhoneNumberPage,
    ProfileSetupPage,
    VerificationFailedPage,
    VerificationPendingPage,
    WalletSetupPage,
    WelcomePage,
    SendPage,
    ChooseContactPage,
    UsersPage,
    UserPage,
    ChangeSponsorModal,
    SettingsPage,
    TermsAndConditionsPage,
    TransactionsPage,
    ChatListComponent,
    ContactsComponent,
    EventListComponent,
    TransactionComponent,
    DateAndTime,
    FilterPipe,
    OrderBy,
    Round,
    Timestamp,
    KeyboardAttachDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig, myFirebaseAuthConfig),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: translateLoaderFactory,
      deps: [Http]
    }),
    IonicModule.forRoot(UrMoney, {
      platforms: {
        ios: {
          statusbarPadding: true
        },
      }
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    UrMoney,
    AboutPage,
    HomePage,
    ChatPage,
    PopoverChatPage,
    ContactsAndChatsPage,
    IdentityVerificationFinishPage,
    IdentityVerificationIntroPage,
    IdentityVerificationPersonalInfoPage,
    IdentityVerificationSponsorWaitPage,
    IdentityVerificationDocumentPage,
    IdentityVerificationSummaryPage,
    IdentityVerificationAddressPage,
    InviteLinkPage,
    AnnouncementInitiatedPage,
    CountryNotSupportedPage,
    AuthenticationCodePage,
    EmailAddressPage,
    IntroPage,
    NoInternetConnectionPage,
    PhoneNumberPage,
    ProfileSetupPage,
    VerificationFailedPage,
    VerificationPendingPage,
    WalletSetupPage,
    WelcomePage,
    SendPage,
    ChooseContactPage,
    UserPage,
    ChangeSponsorModal,
    UsersPage,
    SettingsPage,
    TermsAndConditionsPage,
    TransactionsPage
  ],
  providers: [AuthService, ChartDataService, ContactsService, CountryListService, EncryptionService, EventsService, ToastService, { provide: ErrorHandler, useClass: IonicErrorHandler }]
})
export class AppModule { }
