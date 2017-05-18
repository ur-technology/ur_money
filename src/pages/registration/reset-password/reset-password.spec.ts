import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { IonicModule, NavController, NavParams, LoadingController } from 'ionic-angular';
import { UrMoney } from '../../../app/app.component';
import { NavParamsMock, NavControllerMock, GoogleAnalyticsEventsServiceMock, AuthServiceMock, LoadingControllerMock, ToastServiceMock } from '../../../mocks';
import { ResetPasswordPage } from './reset-password';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import {  advance } from '../../../../testing';
import { SignInPage } from '../sign-in/sign-in';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

let comp: ResetPasswordPage;
let fixture: ComponentFixture<ResetPasswordPage>;

describe('Page: ResetPasswordPage', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UrMoney, ResetPasswordPage],
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
    fixture = TestBed.createComponent(ResetPasswordPage);
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
    fixture = TestBed.createComponent(ResetPasswordPage);
    comp = fixture.componentInstance;
    expect(comp.mainForm.contains('password')).toBe(true);
    expect(comp.mainForm.controls['password'].errors.required).toBe(true);
    expect(comp.mainForm.contains('passwordConfirmation')).toBe(true);
    expect(comp.mainForm.controls['passwordConfirmation'].errors.required).toBe(true);
    expect(navParams.get).toHaveBeenCalledWith('phone');
  });

  it('should call GA to set page name', () => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitCurrentPage');
    comp.ionViewDidEnter();
    expect(googleAnalyticsEventsService.emitCurrentPage).toHaveBeenCalledWith('ResetPasswordPage');
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
    spyOn(auth, 'requestChangeTempPassword').and.returnValue(Promise.resolve('request_change_temp_password_succeeded'));

    comp.submit();
    advance(fixture);

    expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('ResetPasswordPage', 'Click on submit button', 'submit reset passsword info');
    expect(loadingController.component.present).toHaveBeenCalled();
    expect(auth.generateHashedPassword).toHaveBeenCalled();
    expect(auth.requestChangeTempPassword).toHaveBeenCalled();
    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'Your password has been changed. For your security, please sign in with your new password.' });
    expect(navCtrl.setRoot).toHaveBeenCalledWith(SignInPage);
  }));

  it('should show a message when other message arrives', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestChangeTempPassword').and.returnValue(Promise.resolve(''));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'There was an unexpected problem. Please try again later' });
  }));

  it('should show a message when an error occurs', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'requestChangeTempPassword').and.throwError('error');

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'There was an unexpected problem. Please try again later' });
  }));
});
