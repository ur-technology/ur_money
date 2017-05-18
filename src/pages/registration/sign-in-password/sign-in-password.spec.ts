import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IonicModule, NavController, NavParams, LoadingController } from 'ionic-angular';
import { UrMoney } from '../../../app/app.component';
import { NavParamsMock, NavControllerMock, GoogleAnalyticsEventsServiceMock, AuthServiceMock, LoadingControllerMock, ToastServiceMock } from '../../../mocks';
import { SignInPasswordPage } from '../sign-in-password/sign-in-password';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { click, advance } from '../../../../testing';
import { LostPasswordPage } from '../lost-password/lost-password';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

let comp: SignInPasswordPage;
let fixture: ComponentFixture<SignInPasswordPage>;
let de: DebugElement;

describe('Page: SignInPasswordPage', () => {


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UrMoney, SignInPasswordPage],
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
    fixture = TestBed.createComponent(SignInPasswordPage);
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
    fixture = TestBed.createComponent(SignInPasswordPage);
    comp = fixture.componentInstance;
    expect(comp.mainForm.contains('password')).toBe(true);
    expect(comp.mainForm.controls['password'].errors.required).toBe(true);
    expect(navParams.get).toHaveBeenCalledWith('phone');
  });

  it('should call GA to set page name', () => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitCurrentPage');
    comp.ionViewDidEnter();
    expect(googleAnalyticsEventsService.emitCurrentPage).toHaveBeenCalledWith('SignInPasswordPage');
  });

  it('should be able to launch Lost password page', () => {
    comp.phone = '+593998016833';
    let navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'push');
    de = fixture.debugElement.query(By.css('.terms-btn'));
    click(de);
    expect(navCtrl.push).toHaveBeenCalledWith(LostPasswordPage, { phone: '+593998016833' });
  });

  it('should succesfully sign in', fakeAsync(() => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitEvent');

    let loadingController: any = fixture.debugElement.injector.get(LoadingController);
    spyOn(loadingController.component, 'present').and.callThrough();

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'generateHashedPassword');
    spyOn(auth, 'signIn').and.returnValue(Promise.resolve('sign_in_finished'));

    comp.submit();
    advance(fixture);

    expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('SignInPasswordPage', 'Clicked on submit password button', 'submit in password info');
    expect(loadingController.component.present).toHaveBeenCalled();
    expect(auth.generateHashedPassword).toHaveBeenCalled();
    expect(auth.signIn).toHaveBeenCalled();
  }));

  it('should show message when password is incorrect', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'signIn').and.returnValue(Promise.resolve('sign_in_canceled_because_password_incorrect'));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'The number and password that you entered did not match our records. Please double-check and try again.' });
  }));

  it('should show message when user is disabled', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'signIn').and.returnValue(Promise.resolve('request_sign_in_canceled_because_user_disabled'));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'Your user account has been disabled.' });
  }));

  it('should show message when no expected message arrives', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'signIn').and.returnValue(Promise.resolve('other_message'));

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'There was an unexpected problem. Please try again later' });
  }));

  it('should show message when error occurs', fakeAsync(() => {
    let toastService = fixture.debugElement.injector.get(ToastService);
    spyOn(toastService, 'showMessage');

    let auth = fixture.debugElement.injector.get(AuthService);
    spyOn(auth, 'signIn').and.throwError('error');

    comp.submit();
    advance(fixture);

    expect(toastService.showMessage).toHaveBeenCalledWith({ message: 'There was an unexpected problem. Please try again later' });
  }));
});
