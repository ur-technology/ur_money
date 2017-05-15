import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IonicModule, NavController } from 'ionic-angular';
import { UrMoney } from '../../../app/app.component';
import { NavMock } from '../../../mocks';
import { GoogleAnalyticsEventsServiceMock } from '../../../mocks';
import { SignUpPage } from '../sign-up/sign-up';
import { SignInPage } from '../sign-in/sign-in';
import { WelcomePage } from './welcome';
import {GoogleAnalyticsEventsService} from '../../../services/google-analytics-events.service';

let comp: WelcomePage;
let fixture: ComponentFixture<WelcomePage>;
let de: DebugElement;
let el: HTMLElement;

describe('Page: WelcomePage', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UrMoney, WelcomePage],
      providers: [
        {
          provide: NavController,
          useClass: NavMock
        },
        {
          provide: GoogleAnalyticsEventsService,
          useClass: GoogleAnalyticsEventsServiceMock
        }
      ],
      imports: [
        IonicModule.forRoot(UrMoney)
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomePage);
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

  it('should be able to launch SignUpPage', () => {
    let navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'push');

    de = fixture.debugElement.query(By.css('button'));

    de.triggerEventHandler('click', null);

    expect(navCtrl.push).toHaveBeenCalledWith(SignUpPage);
  });

  it('should be able to launch SignInPage', () => {
    let navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'push');

    let buttons: DebugElement[] = fixture.debugElement.queryAll(By.css('button'));
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].nativeElement.innerText.includes("Sign In")) {
        de = buttons[i];
        break;
      }
    }

    de.triggerEventHandler('click', null);

    expect(navCtrl.push).toHaveBeenCalledWith(SignInPage);
  });

  it('should call GA to set page name', () => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitCurrentPage');
    comp.ionViewDidEnter();
    expect(googleAnalyticsEventsService.emitCurrentPage).toHaveBeenCalledWith('WelcomePage');
  });

  it('should call GA event to announce sign up', () => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitEvent');
    comp.signUp();
    expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('WelcomePage', 'Clicked sign up button', 'signUp()');
  });

  it('should call GA event to announce sign in', () => {
    let googleAnalyticsEventsService = fixture.debugElement.injector.get(GoogleAnalyticsEventsService);
    spyOn(googleAnalyticsEventsService, 'emitEvent');
    comp.signIn();
    expect(googleAnalyticsEventsService.emitEvent).toHaveBeenCalledWith('WelcomePage', 'Clicked sign in button', 'signIn()');
  });
});
