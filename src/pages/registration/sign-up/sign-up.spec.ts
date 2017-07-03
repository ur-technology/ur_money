import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IonicModule, AlertController, ModalController, NavController, LoadingController } from 'ionic-angular';
import { UrMoney } from '../../../app/app.component';
import { ModalControllerMock, AlertControllerMock, CountryListServiceMock, NavControllerMock, GoogleAnalyticsEventsServiceMock, AuthServiceMock, LoadingControllerMock, ToastServiceMock } from '../../../mocks';
import { SignUpPage } from './sign-up';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { click, advance } from '../../../../testing';
import { CountryListService } from '../../../services/country-list';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions';
import { AuthenticationCodePage } from '../authentication-code/authentication-code';

let comp: SignUpPage;
let fixture: ComponentFixture<SignUpPage>;
let de: DebugElement;

describe('Page: SignUpPage', () => {


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UrMoney, SignUpPage],
      providers: [
        {
          provide: CountryListService,
          useClass: CountryListServiceMock
        },
        {
          provide: NavController,
          useClass: NavControllerMock
        },
        {
          provide: GoogleAnalyticsEventsService,
          useClass: GoogleAnalyticsEventsServiceMock
        },
        {
          provide: AuthService,
          useClass: AuthServiceMock
        },
        {
          provide: LoadingController,
          useClass: LoadingControllerMock
        },
        {
          provide: ToastService,
          useClass: ToastServiceMock
        },
        {
          provide: ModalController,
          useClass: ModalControllerMock
        },
        {
          provide: AlertController,
          useClass: AlertControllerMock
        }
      ],
      imports: [
        IonicModule.forRoot(UrMoney)
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpPage);
    comp = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    comp = null;
  });

  it('is created', () => {
    expect(fixture).toBeTruthy();
    expect(comp).toBeTruthy();
  });

  it('should call GA to set page name', () => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitCurrentPage');
    comp.ionViewDidEnter();
    expect(googleAnalyticsEventsService.emitCurrentPage).toHaveBeenCalledWith('SignUpPage');
  });

  it('should call GA to set page name', () => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitCurrentPage');
    comp.ionViewDidEnter();
    expect(googleAnalyticsEventsService.emitCurrentPage).toHaveBeenCalledWith('SignUpPage');
  });

  it('should change page title to sponsor', () => {
    comp.signUpType = 'email';
    comp.changeSignUpType();
    expect(comp.subheadingButton).toBe('Sign up with email instead');
    expect(comp.mainForm.controls['email'].errors).toBeNull();
  });

  it('should change page title to email', () => {
    comp.signUpType = 'sponsorReferralCode';
    comp.changeSignUpType();
    expect(comp.subheadingButton).toBe('Sign up with referral code instead');
    expect(comp.mainForm.controls['sponsorReferralCode'].errors).toBeNull();
  });

  it('should be able to launch TermsAndConditionsPage', () => {
    let modalController = fixture.debugElement.injector.get(ModalController);
    spyOn(modalController, 'create').and.callThrough();
    de = fixture.debugElement.query(By.css('.terms-btn'));
    click(de);
    expect(modalController.create).toHaveBeenCalledWith(TermsAndConditionsPage)
  });

  it('should clear phone input when changing country', fakeAsync(() => {
    comp.mainForm.controls['phone'].setValue('998016833');
    advance(fixture);
    advance(fixture);
    de = fixture.debugElement.query(By.css('input[type=tel]'));
    expect(de.nativeElement.value).toEqual('998016833');
    comp.onChangeCountry();
    advance(fixture);
    advance(fixture);
    de = fixture.debugElement.query(By.css('input[type=tel]'));
    expect(de.nativeElement.value).toEqual('');
  }));

  it('should successfully sign up and launch Authentication code page', fakeAsync(() => {
    let loadingController: any = fixture.debugElement.injector.get(LoadingController);
    spyOn(loadingController.component, 'present').and.callThrough();

    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitEvent');

    let navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'push');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignUpCodeGeneration').and.returnValue(Promise.resolve('code_generation_finished'));

    comp.submit();
    advance(fixture);

    expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('SignUpPage', 'Sign up requested', 'submit sign up info');
    expect(loadingController.component.present).toHaveBeenCalled();
    expect(auth.requestSignUpCodeGeneration).toHaveBeenCalled();
    expect(navCtrl.push).toHaveBeenCalledWith(AuthenticationCodePage);
  }));

  it('should alert user when user is already signed up', fakeAsync(() => {
    let alertController = fixture.debugElement.injector.get(AlertController);
    spyOn(alertController, 'create').and.callThrough();

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignUpCodeGeneration').and.returnValue(Promise.resolve('code_generation_canceled_because_user_already_signed_up'));

    comp.submit();
    advance(fixture);

    expect(alertController.create).toHaveBeenCalled();
  }));

  it('should show a message that voip is not allowed', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignUpCodeGeneration').and.returnValue(Promise.resolve('code_generation_canceled_because_voip_phone_not_allowed'));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: "Signups via a VOIP or other virtual service like Skype and Google voice are not allowed. Please use a number provided by a conventional mobile carrier." });
  }));

  it('should show a message that user is not found', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignUpCodeGeneration').and.returnValue(Promise.resolve('code_generation_canceled_because_email_not_found'));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: "The email that you entered was not found in our records. Please double-check and try again." });
  }));

  it('should show a message that sponsor is not found', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignUpCodeGeneration').and.returnValue(Promise.resolve('code_generation_canceled_because_sponsor_not_found'));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: "There is no sponsor with that referral code, please try another referral code" });
  }));

  it('should show a message that sponsor is disabled', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignUpCodeGeneration').and.returnValue(Promise.resolve('code_generation_canceled_because_sponsor_disabled'));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: "There is no sponsor with that referral code, please try another referral code" });
  }));

  it('should show a message when other message arrives from the api', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignUpCodeGeneration').and.returnValue(Promise.resolve(''));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: "There was an unexpected problem. Please try again later" });
  }));

  it('should show a message when other message arrives from the api', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignUpCodeGeneration').and.throwError('error')

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: "There was an unexpected problem. Please try again later" });
  }));

});
