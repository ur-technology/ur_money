import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IonicModule, NavController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { UrMoney } from '../../../app/app.component';
import { NavMock, GoogleAnalyticsEventsServiceMock, ModalControllerMock, AuthServiceMock, LoadingControllerMock, ToastServiceMock, AlertControllerMock } from '../../../mocks';
import { CountryListServiceMock } from '../../../mocks';
// import { SignUpPage } from '../sign-up/sign-up';
import { SignInPasswordPage } from '../sign-in-password/sign-in-password';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions';
import { SignInPage } from './sign-in';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';
import { CountryListService } from '../../../services/country-list';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { click, advance } from '../../../../testing';
import { Utils } from '../../../services/utils';
import { SignInTemporaryCodePage } from '../sign-in-temporary-code/sign-in-temporary-code';

let comp: SignInPage;
let fixture: ComponentFixture<SignInPage>;
let de: DebugElement;

describe('Page: SignInPage', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UrMoney, SignInPage],
      providers: [
        {
          provide: NavController,
          useClass: NavMock
        },
        {
          provide: GoogleAnalyticsEventsService,
          useClass: GoogleAnalyticsEventsServiceMock
        },
        {
          provide: CountryListService,
          useClass: CountryListServiceMock
        },
        {
          provide: AuthService,
          useClass: AuthServiceMock
        },
        {
          provide: ModalController,
          useClass: ModalControllerMock
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
    fixture = TestBed.createComponent(SignInPage);
    comp = fixture.componentInstance;
  });
  // beforeEach(async(() => {
  //   fixture = TestBed.createComponent(SignInPage);
  //   comp = fixture.componentInstance;
  //   fixture.detectChanges();
  //   return fixture.whenStable().then(() => {
  //     fixture.detectChanges();
  //   });
  // }));

  afterEach(() => {
    fixture.destroy();
    comp = null;
  });

  it('is created', () => {
    expect(fixture).toBeTruthy();
    expect(comp).toBeTruthy();
  });

  it('should fill class variables', () => {
    let countryListService = fixture.debugElement.injector.get(CountryListService);
    spyOn(countryListService, 'getCountryData');
    spyOn(countryListService, 'getDefaultContry');
    fixture = TestBed.createComponent(SignInPage);
    comp = fixture.componentInstance;
    expect(countryListService.getCountryData).toHaveBeenCalled();
    expect(countryListService.getDefaultContry).toHaveBeenCalled();
    expect(comp.mainForm.contains('country')).toBe(true);
    expect(comp.mainForm.contains('phone')).toBe(true);
    expect(comp.mainForm.controls['country'].errors.required).toBe(true);;
    expect(comp.mainForm.controls['phone'].errors.required).toBe(true);;
  });

  it('should call GA to set page name', () => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitCurrentPage');
    comp.ionViewDidEnter();
    expect(googleAnalyticsEventsService.emitCurrentPage).toHaveBeenCalledWith('SignInPage');
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

  it('should launch Sign in password page after succesfull sign in', fakeAsync(() => {
    comp.mainForm.controls['phone'].setValue('9373964400');
    let loadingController: any = fixture.debugElement.injector.get(LoadingController);
    spyOn(loadingController.component, 'present').and.callThrough();
    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignIn').and.returnValue(Promise.resolve('request_sign_in_succeded'));
    let navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'push');
    comp.submit();
    advance(fixture);
    expect(auth.requestSignIn).toHaveBeenCalled();
    expect(loadingController.component.present).toHaveBeenCalled();
    expect(navCtrl.push).toHaveBeenCalledWith(SignInPasswordPage, { phone: '+19373964400' });
  }));

  it('should call Utils to transform phone to E164', fakeAsync(() => {
    comp.mainForm.controls['phone'].setValue('9373964400');
    spyOn(Utils, 'toE164FormatPhoneNumber');
    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignIn').and.returnValue(Promise.resolve('request_sign_in_succeded'));
    comp.submit();
    advance(fixture);
    expect(Utils.toE164FormatPhoneNumber).toHaveBeenCalledWith('9373964400', 'US');
  }));


  it('should launch Sign In temporary code page', fakeAsync(() => {
    comp.mainForm.controls['phone'].setValue('9373964400');
    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignIn').and.returnValue(Promise.resolve('request_sign_in_canceled_because_user_does_not_have_password_set'));
    let navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'push');
    comp.submit();
    advance(fixture);
    expect(navCtrl.push).toHaveBeenCalledWith(SignInTemporaryCodePage, { phone: '+19373964400' });
  }));

  it('should show message when user is disabled and tries to sign in', fakeAsync(() => {
    comp.mainForm.controls['phone'].setValue('9373964400');
    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignIn').and.returnValue(Promise.resolve('request_sign_in_canceled_because_user_disabled'));
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');
    comp.submit();
    advance(fixture);
    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'Your user account has been disabled.' });
  }));

  it('should show alert that user has to sign up first', fakeAsync(() => {
    comp.mainForm.controls['phone'].setValue('9373964400');
    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignIn').and.returnValue(Promise.resolve('request_sign_in_canceled_because_user_not_found'));
    let alertCtrl = fixture.debugElement.injector.get(AlertController);
    spyOn(alertCtrl, 'create').and.callThrough();
    comp.submit();
    advance(fixture);
    expect(alertCtrl.create).toHaveBeenCalled();
  }));

  it('should show message if an error occurs', fakeAsync(() => {
    comp.mainForm.controls['phone'].setValue('9373964400');
    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestSignIn').and.throwError('error');
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');
    let loadingController: any = fixture.debugElement.injector.get(LoadingController);
    spyOn(loadingController.component, 'dismiss').and.callThrough();

    comp.submit();

    advance(fixture);
    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'There was an unexpected problem. Please try again later' });
    expect(loadingController.component.dismiss).toHaveBeenCalled();
  }));


});
