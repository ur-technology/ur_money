import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { IonicModule, NavController, NavParams, LoadingController } from 'ionic-angular';
import { UrMoney } from '../../../app/app.component';
import { NavParamsMock, NavControllerMock, GoogleAnalyticsEventsServiceMock, AuthServiceMock, LoadingControllerMock, ToastServiceMock } from '../../../mocks';
import { SignInTemporaryCodePage } from '../sign-in-temporary-code/sign-in-temporary-code';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import {  advance } from '../../../../testing';
import { ResetPasswordPage } from '../reset-password/reset-password';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

let comp: SignInTemporaryCodePage;
let fixture: ComponentFixture<SignInTemporaryCodePage>;

describe('Page: SignInTemporaryCodePage', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UrMoney, SignInTemporaryCodePage],
      providers: [
        {
          provide: NavController,
          useClass: NavControllerMock
        },
        {
          provide: NavParams,
          useClass: NavParamsMock
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
        }
      ],
      imports: [
        IonicModule.forRoot(UrMoney)
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInTemporaryCodePage);
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

  it('should fill class variables', () => {
    let navParams = fixture.debugElement.injector.get(NavParams);
    spyOn(navParams, 'get');
    fixture = TestBed.createComponent(SignInTemporaryCodePage);
    comp = fixture.componentInstance;
    expect(comp.mainForm.contains('code')).toBe(true);
    expect(comp.mainForm.controls['code'].errors.required).toBe(true);
    expect(navParams.get).toHaveBeenCalledWith('phone');
  });

  it('should call GA to set page name', () => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitCurrentPage');
    comp.ionViewDidEnter();
    expect(googleAnalyticsEventsService.emitCurrentPage).toHaveBeenCalledWith('SignInTemporaryCodePage');
  });

  it('should succesfully check temp code', fakeAsync(() => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitEvent');

    let loadingController: any = fixture.debugElement.injector.get(LoadingController);
    spyOn(loadingController.component, 'present').and.callThrough();

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestCheckTempCode').and.returnValue(Promise.resolve('request_check_temp_password_succeded'));

    let navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'setRoot');

    comp.phone = '+593998016833';
    comp.submit();
    advance(fixture);

    expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('SignInTemporaryCodePage', 'Clicked on submit code button', `Phone: +593998016833 - submit sign in temporary code`);
    expect(loadingController.component.present).toHaveBeenCalled();
    expect(auth.requestCheckTempCode).toHaveBeenCalled();
    expect(navCtrl.setRoot).toHaveBeenCalledWith(ResetPasswordPage, { phone: '+593998016833' });
  }));

  it('should show message when temp password is incorrect', fakeAsync(() => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitEvent');

    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestCheckTempCode').and.returnValue(Promise.resolve('request_check_temp_password_canceled_because_wrong_password'));

    comp.phone = '+593998016833';
    comp.submit();
    advance(fixture);

    expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('SignInTemporaryCodePage', 'Wrong code submited', `Phone: +593998016833 - temp code - wrong code`);
    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'The number and password that you entered did not match our records. Please double-check and try again.' });
  }));


  it('should show message when user is not found', fakeAsync(() => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitEvent');

    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestCheckTempCode').and.returnValue(Promise.resolve('request_check_temp_password_canceled_because_user_not_found'));

    comp.phone = '+593998016833';
    comp.submit();
    advance(fixture);

    expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('SignInTemporaryCodePage', 'User not found', `Phone: +593998016833 - temp code - user not found`);
    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'Your user account has been disabled.' });
  }));

  it('should show message when no message is sent', fakeAsync(() => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitEvent');

    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestCheckTempCode').and.returnValue(Promise.resolve('other_message'));

    comp.phone = '+593998016833';
    comp.submit();
    advance(fixture);

    expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('SignInTemporaryCodePage', 'Unexpected Problem', `Phone: +593998016833 - temp code - problem`);
    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'There was an unexpected problem. Please try again later' });
  }));

  it('should show message when error occurs', fakeAsync(() => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitEvent');

    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestCheckTempCode').and.throwError('error');

    comp.phone = '+593998016833';
    comp.submit();
    advance(fixture);

    expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('SignInTemporaryCodePage', 'Unexpected Problem', `Phone: +593998016833 - temp code - error`);
    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'There was an unexpected problem. Please try again later' });
  }));
});
