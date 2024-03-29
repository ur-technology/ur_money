import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { TrackJsErrorHandler } from '../services/trackjs.handler';
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
import { ReferralsPage } from '../pages/referrals/referrals';
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
import { ChangePasswordPage } from '../pages/settings/change-password/change-password';
import { LostPasswordPage } from '../pages/registration/lost-password/lost-password';
import { SignInTemporaryCodePage } from '../pages/registration/sign-in-temporary-code/sign-in-temporary-code';
import { ResetPasswordPage } from '../pages/registration/reset-password/reset-password';
import { ResetPasswordWithCodePage } from '../pages/registration/reset-password-with-code/reset-password-with-code';
import { SignInPasswordPage } from '../pages/registration/sign-in-password/sign-in-password';
import { SettingsAccountPage } from '../pages/settings/settings-account/settings-account';
import { ChangeEmailPage } from '../pages/settings/change-email/change-email'
import { SettingsNotificationsPage } from '../pages/settings/settings-notifications/settings-notifications';
import { TermsAndConditionsPage } from '../pages/terms-and-conditions/terms-and-conditions';
import { TransactionsPage } from '../pages/transactions/transactions';
import { ChatListComponent } from '../components/chat-list/chat-list';
import { ContactsComponent } from '../components/contacts/contacts';
import { RecipientsComponent } from '../components/recipients/recipients';
import { EventListComponent } from '../components/event-list/event-list';
import { TransactionComponent } from '../components/transaction/transaction';
import { DateAndTime } from '../pipes/dateAndTime.pipe';
import { FilterPipe } from '../pipes/filterPipe';
import { OrderBy } from '../pipes/orderBy';
import { Round } from '../pipes/round';
import { UrFormat } from '../pipes/urFormat';
import { Timestamp } from '../pipes/timestamp';
import { AuthService } from '../services/auth';
import { ChartDataService } from '../services/chart-data.service';
import { ContactsService } from '../services/contacts.service';
import { CountryListService } from '../services/country-list';
import { EncryptionService } from '../services/encryption';
import { EventsService } from '../services/events.service';
import { ToastService } from '../services/toast';
import { AcuantService } from '../services/acuant';
import { HttpModule } from '@angular/http';
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { FormsModule } from '@angular/forms';
import { Config } from '../config/config';
import { SponsorWaitPage } from '../pages/sponsor-wait/sponsor-wait';
import { UserService } from '../services/user.service';
import { GoogleAnalyticsEventsService } from '../services/google-analytics-events.service';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Clipboard } from '@ionic-native/clipboard';
import { Toast } from '@ionic-native/toast';
import { Keyboard } from '@ionic-native/keyboard';
import { NativeStorage } from '@ionic-native/native-storage';
import { Contacts } from '@ionic-native/contacts';

export const firebaseConfig = {
  apiKey: Config.firebaseApiKey,
  authDomain: Config.firebaseProjectId + '.firebaseapp.com',
  databaseURL: 'https://' + Config.firebaseProjectId + '.firebaseio.com',
  storageBucket: Config.firebaseProjectId + '.appspot.com'
};

@NgModule({
  declarations: [
    UrMoney,
    AboutPage,
    HomePage,
    ChatPage,
    PopoverChatPage,
    ContactsAndChatsPage,
    InviteLinkPage,
    ReferralsPage,
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
    RecipientsComponent,
    EventListComponent,
    TransactionComponent,
    DateAndTime,
    FilterPipe,
    OrderBy,
    Round,
    UrFormat,
    Timestamp,
    ChangePasswordPage,
    ChangeEmailPage,
    SignInPasswordPage,
    LostPasswordPage,
    SignInTemporaryCodePage,
    ResetPasswordPage,
    ResetPasswordWithCodePage,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),// imports firebase/app needed for everything
    AngularFireDatabaseModule, // imports firebase/database, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
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
    ReferralsPage,
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
    ChangePasswordPage,
    ChangeEmailPage,
    SignInPasswordPage,
    LostPasswordPage,
    SignInTemporaryCodePage,
    ResetPasswordPage,
    ResetPasswordWithCodePage,
  ],
  providers: [
    AuthService,
    ChartDataService,
    ContactsService,
    CountryListService,
    EncryptionService,
    EventsService,
    ToastService,
    AcuantService,
    UserService,
    GoogleAnalyticsEventsService,
    UrFormat,
    SplashScreen,
    StatusBar,
    SocialSharing,
    Clipboard,
    Toast,
    LocalNotifications,
    Keyboard,
    NativeStorage,
    Contacts,
    { provide: ErrorHandler, useClass: TrackJsErrorHandler },
  ]
})
export class AppModule { }
