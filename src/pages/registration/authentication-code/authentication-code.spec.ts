import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { IonicModule, NavController, LoadingController } from 'ionic-angular';
import { UrMoney } from '../../../app/app.component';
import { NavControllerMock, GoogleAnalyticsEventsServiceMock, AuthServiceMock, LoadingControllerMock, ToastServiceMock } from '../../../mocks';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { advance } from '../../../../testing';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';
import { AuthenticationCodePage } from './authentication-code';

let comp: AuthenticationCodePage;
let fixture: ComponentFixture<AuthenticationCodePage>;

describe('Page: AuthenticationCodePage', () => {


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UrMoney, AuthenticationCodePage],
            providers: [
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
                    provide: NavController,
                    useClass: NavControllerMock
                }
            ],
            imports: [
                IonicModule.forRoot(UrMoney)
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthenticationCodePage);
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
        expect(googleAnalyticsEventsService.emitCurrentPage).toHaveBeenCalledWith('AuthenticationCodePage');
    });

    it('should return to previus page', () => {
        let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
        spyOn(googleAnalyticsEventsService, 'emitEvent');

        let navController = fixture.debugElement.injector.get(NavController);
        spyOn(navController, 'pop');

        comp.resendCode();

        expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('AuthenticationCodePage', 'Click on resend code', 'resendCode()');
        expect(navController.pop).toHaveBeenCalled();
    });

    it('should should successfully match code', fakeAsync(() => {
        let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
        spyOn(googleAnalyticsEventsService, 'emitEvent');


        let loadingController: any = fixture.debugElement.injector.get(LoadingController);
        spyOn(loadingController.component, 'present').and.callThrough();

        let auth = fixture.debugElement.injector.get(AuthService);
        spyOn(auth, 'checkFirebaseConnection');
        spyOn(auth, 'checkSignUpCodeMatching').and.returnValue(Promise.resolve(true));

        comp.checkCode();
        advance(fixture);

        expect(loadingController.component.present).toHaveBeenCalled();
        expect(auth.checkFirebaseConnection).toHaveBeenCalled();
        expect(auth.checkSignUpCodeMatching).toHaveBeenCalled();
        expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('AuthenticationCodePage', 'Code match succeeded', 'SMS code correct');
    }));

    it('should show a message is code is incorrect', fakeAsync(() => {
        let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
        spyOn(googleAnalyticsEventsService, 'emitEvent');

        let toastService: any = fixture.debugElement.injector.get(ToastService);
        spyOn(toastService, 'showMessage');

        let auth = fixture.debugElement.injector.get(AuthService);
        spyOn(auth, 'checkSignUpCodeMatching').and.returnValue(Promise.resolve(false));

        comp.checkCode();
        advance(fixture);

        expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('AuthenticationCodePage', 'Code was invalid', 'SMS code incorrect');
        expect(toastService.showMessage).toHaveBeenCalledWith({ message: "The verification code you entered is incorrect or expired. Please try again." });
    }));

    it('should show a message if an error occurs', fakeAsync(() => {
        let loadingController: any = fixture.debugElement.injector.get(LoadingController);
        spyOn(loadingController.component, 'present').and.callThrough();

        let toastService: any = fixture.debugElement.injector.get(ToastService);
        spyOn(toastService, 'showMessage');

        let auth = fixture.debugElement.injector.get(AuthService);
        spyOn(auth, 'checkSignUpCodeMatching').and.throwError('error');

        comp.checkCode();
        advance(fixture);

        expect(toastService.showMessage).toHaveBeenCalledWith({ message: "There was an unexpected problem. Please try again later" });
    }));

});