import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IonicModule, NavController, NavParams, LoadingController } from 'ionic-angular';
import { UrMoney } from '../../../app/app.component';
import { NavParamsMock, NavControllerMock, GoogleAnalyticsEventsServiceMock, AuthServiceMock, LoadingControllerMock, ToastServiceMock } from '../../../mocks';
import { SignInPasswordPage } from '../sign-in-password/sign-in-password';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { advance } from '../../../../testing';
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

});
