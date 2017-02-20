import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { UrMoney } from './app.component';
import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';
import { ChatPage } from '../pages/chat/chat';
import { ContactsAndChatsPage } from '../pages/contacts-and-chats/contacts-and-chats';
import { AnnouncementInitiatedPage } from '../pages/announcement-initiated/announcement-initiated';
import { AuthenticationCodePage } from '../pages/registration/authentication-code/authentication-code';
import { IntroPage } from '../pages/registration/intro/intro';
import { NoInternetConnectionPage } from '../pages/no-internet-connection/no-internet-connection';
import { SignUpPage } from '../pages/registration/sign-up/sign-up';
import { SignInPage } from '../pages/registration/sign-in/sign-in';
import { InviteLinkPage } from '../pages/invite-link/invite-link';
import { IdScanPage } from '../pages/registration/id-scan/id-scan';
import { SelfieMatchPage } from '../pages/registration/selfie-match/selfie-match';
import { ProfileSetupPage } from '../pages/registration/profile-setup/profile-setup';
import { PopoverChatPage } from '../pages/chat/popover-chat';
import { WalletSetupPage } from '../pages/registration/wallet-setup/wallet-setup';
import { WelcomePage } from '../pages/registration/welcome/welcome';
import { SendPage } from '../pages/send/send';
import { ChooseContactPage } from '../pages/choose-contact/choose-contact';
import { UsersPage } from '../pages/admin/users';
import { UserPage } from '../pages/admin/user';
import { ChangeSponsorModal } from '../pages/admin/change-sponsor';
import { SettingsPage } from '../pages/settings/settings/settings';
import {ChangePasswordPage} from '../pages/settings/change-password/change-password';
import { SettingsAccountPage } from '../pages/settings/settings-account/settings-account';
import { SettingsNotificationsPage } from '../pages/settings/settings-notifications/settings-notifications';
import { TermsAndConditionsPage } from '../pages/terms-and-conditions/terms-and-conditions';
import { TransactionsPage } from '../pages/transactions/transactions';
import { ChatListComponent } from '../components/chat-list/chat-list';
import { ContactsComponent } from '../components/contacts/contacts';
import { EventListComponent } from '../components/event-list/event-list';
import { TransactionComponent } from '../components/transaction/transaction';
import { DateAndTime } from '../pipes/dateAndTime.pipe';
import { FilterPipe } from '../pipes/filterPipe';
import { OrderBy } from '../pipes/orderBy';
import { Round } from '../pipes/round';
import { Timestamp } from '../pipes/timestamp';
import { AuthService } from '../services/auth';
import { ChartDataService } from '../services/chart-data.service';
import { ContactsService } from '../services/contacts.service';
import { CountryListService } from '../services/country-list';
import { EncryptionService } from '../services/encryption';
import { EventsService } from '../services/events.service';
import { ToastService } from '../services/toast';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { Http, HttpModule } from '@angular/http';
import { BrowserModule } from "@angular/platform-browser";
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import { FormsModule } from '@angular/forms';
import { Config } from '../config/config';
import { SponsorWaitPage } from '../pages/sponsor-wait/sponsor-wait';
import { UserService } from '../services/user.service';


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
    InviteLinkPage,
    AnnouncementInitiatedPage,
    AuthenticationCodePage,
    IntroPage,
    NoInternetConnectionPage,
    SignUpPage,
    SignInPage,
    IdScanPage,
    SelfieMatchPage,
    ProfileSetupPage,
    WalletSetupPage,
    WelcomePage,
    SendPage,
    ChooseContactPage,
    UsersPage,
    UserPage,
    ChangeSponsorModal,
    SettingsPage,
    SettingsAccountPage,
    SettingsNotificationsPage,
    TermsAndConditionsPage,
    TransactionsPage,
    SponsorWaitPage,
    ChatListComponent,
    ContactsComponent,
    EventListComponent,
    TransactionComponent,
    DateAndTime,
    FilterPipe,
    OrderBy,
    Round,
    Timestamp,
    ChangePasswordPage
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
    InviteLinkPage,
    AnnouncementInitiatedPage,
    AuthenticationCodePage,
    IntroPage,
    NoInternetConnectionPage,
    SignUpPage,
    SignInPage,
    IdScanPage,
    SelfieMatchPage,
    ProfileSetupPage,
    WalletSetupPage,
    WelcomePage,
    SendPage,
    ChooseContactPage,
    UserPage,
    ChangeSponsorModal,
    UsersPage,
    SettingsPage,
    SettingsAccountPage,
    SettingsNotificationsPage,
    TermsAndConditionsPage,
    TransactionsPage,
    SponsorWaitPage,
    ChangePasswordPage
  ],
  providers: [AuthService, ChartDataService, ContactsService, CountryListService, EncryptionService, EventsService, ToastService, UserService, { provide: ErrorHandler, useClass: IonicErrorHandler }]
})
export class AppModule { }
