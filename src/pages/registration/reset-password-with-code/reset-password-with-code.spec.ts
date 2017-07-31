import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { IonicModule, NavController, NavParams, LoadingController } from 'ionic-angular';
import { UrMoney } from '../../../app/app.component';
import { NavParamsMock, NavControllerMock, GoogleAnalyticsEventsServiceMock, AuthServiceMock, LoadingControllerMock, ToastServiceMock } from '../../../mocks';
import { ResetPasswordWithCodePage } from './reset-password-with-code';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { advance } from '../../../../testing';
import { SignInPage } from '../sign-in/sign-in';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

let comp: ResetPasswordWithCodePage;
let fixture: ComponentFixture<ResetPasswordWithCodePage>;

describe('Page: ResetPasswordWithCodePage', () => {


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UrMoney, ResetPasswordWithCodePage],
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
    fixture = TestBed.createComponent(ResetPasswordWithCodePage);
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

    fixture = TestBed.createComponent(ResetPasswordWithCodePage);
    comp = fixture.componentInstance;

    expect(comp.mainForm.contains('password')).toBe(true);
    expect(comp.mainForm.controls['password'].errors.required).toBe(true);
    expect(comp.mainForm.contains('passwordConfirmation')).toBe(true);
    expect(comp.mainForm.controls['passwordConfirmation'].errors.required).toBe(true);
    expect(navParams.get).toHaveBeenCalledWith('resetCode');
  });

  it('should call GA to set page name', () => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitCurrentPage');
    comp.ionViewDidEnter();
    expect(googleAnalyticsEventsService.emitCurrentPage).toHaveBeenCalledWith('ResetPasswordWithCodePage');
  });

  it('should succesfully reset password', fakeAsync(() => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitEvent');

    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let loadingController: any = fixture.debugElement.injector.get(LoadingController);
    spyOn(loadingController.component, 'present').and.callThrough();

    let navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'setRoot');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'generateHashedPassword');
    spyOn(auth, 'resetPasswordWithCode').and.returnValue(Promise.resolve('reset_password_finished'));

    comp.submit();
    advance(fixture);

    expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('ResetPasswordWithCodePage', 'Click on submit button', 'submit reset password info');
    expect(loadingController.component.present).toHaveBeenCalled();
    expect(auth.generateHashedPassword).toHaveBeenCalled();
    expect(auth.resetPasswordWithCode).toHaveBeenCalled();
    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'Your password has been changed. For your security, please sign in with your new password.' });
    expect(navCtrl.setRoot).toHaveBeenCalledWith(SignInPage);
  }));

  it('should show a message when user is not found', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'resetPasswordWithCode').and.returnValue(Promise.resolve('reset_password_canceled_because_user_not_found'));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'The reset code that you entered did not match our records. Please double-check and try again.' });
  }));

  it('should show a message when user is disabled', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'resetPasswordWithCode').and.returnValue(Promise.resolve('reset_password_canceled_because_user_disabled'));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'Your user account has been disabled.' });
  }));

  it('should show a message when user is disabled', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'resetPasswordWithCode').and.returnValue(Promise.resolve('reset_password_canceled_because_email_not_verified'));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'Your email is not verified. Please contact support@ur.technology.' });
  }));

  it('should show a message other message arrives', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'resetPasswordWithCode').and.returnValue(Promise.resolve('other'));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'There was an unexpected problem. Please try again later' });
  }));

  it('should show a message when an error occurs', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'resetPasswordWithCode').and.throwError('error');

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'There was an unexpected problem. Please try again later' });
  }));
});
