import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { EPerson } from '../../../../core/eperson/models/eperson.model';
import { EPersonMock } from '../../../testing/eperson.mock';
import { authReducer } from '../../../../core/auth/auth.reducer';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthServiceStub } from '../../../testing/auth-service.stub';
import { AppState } from '../../../../app.reducer';
import { AuthMethod } from '../../../../core/auth/models/auth.method';
import { AuthMethodType } from '../../../../core/auth/models/auth.method-type';
import { LogInOidcComponent } from './log-in-oidc.component';
import { NativeWindowService } from '../../../../core/services/window.service';
import { RouterStub } from '../../../testing/router.stub';
import { ActivatedRouteStub } from '../../../testing/active-router.stub';
import { NativeWindowMockFactory } from '../../../mocks/mock-native-window-ref';

describe('LogInOidcComponent', () => {

  let component: LogInOidcComponent;
  let fixture: ComponentFixture<LogInOidcComponent>;
  let page: Page;
  let user: EPerson;
  let componentAsAny: any;
  let setHrefSpy;
  let oidcBaseUrl;
  let location;

  let authState;

  beforeEach(() => {
    user = EPersonMock;
    oidcBaseUrl = 'dspace-rest.test/oidc?redirectUrl=';
    location = oidcBaseUrl + 'http://dspace-angular.test/home';

    authState = {
      authenticated: false,
      loaded: false,
      loading: false,
    };
  });

  beforeEach(async(() => {
    // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(authReducer),
        TranslateModule.forRoot()
      ],
      declarations: [
        LogInOidcComponent
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: 'authMethodProvider', useValue: new AuthMethod(AuthMethodType.Oidc, location) },
        { provide: NativeWindowService, useFactory: NativeWindowMockFactory },
        { provide: Router, useValue: new RouterStub() },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
      .compileComponents();

  }));

  beforeEach(inject([Store], (store: Store<AppState>) => {
    store
      .subscribe((state) => {
        (state as any).core = Object.create({});
        (state as any).core.auth = authState;
      });

    // create component and test fixture
    fixture = TestBed.createComponent(LogInOidcComponent);

    // get test component from the fixture
    component = fixture.componentInstance;
    componentAsAny = component;

    // create page
    page = new Page(component, fixture);
    setHrefSpy = spyOnProperty(componentAsAny._window.nativeWindow.location, 'href', 'set').and.callThrough();

  }));

  it('should set the properly a new redirectUrl', () => {
    const currentUrl = 'http://dspace-angular.test/collections/12345';
    componentAsAny._window.nativeWindow.location.href = currentUrl;

    fixture.detectChanges();

    expect(componentAsAny.injectedAuthMethodModel.location).toBe(location);
    expect(componentAsAny._window.nativeWindow.location.href).toBe(currentUrl);

    component.redirectToOidc();

    expect(setHrefSpy).toHaveBeenCalledWith(oidcBaseUrl + currentUrl)

  });

  it('should not set a new redirectUrl', () => {
    const currentUrl = 'http://dspace-angular.test/home';
    componentAsAny._window.nativeWindow.location.href = currentUrl;

    fixture.detectChanges();

    expect(componentAsAny.injectedAuthMethodModel.location).toBe(location);
    expect(componentAsAny._window.nativeWindow.location.href).toBe(currentUrl);

    component.redirectToOidc();

    expect(setHrefSpy).toHaveBeenCalledWith(oidcBaseUrl + currentUrl)

  });

});

/**
 * I represent the DOM elements and attach spies.
 *
 * @class Page
 */
class Page {

  public emailInput: HTMLInputElement;
  public navigateSpy: jasmine.Spy;
  public passwordInput: HTMLInputElement;

  constructor(private component: LogInOidcComponent, private fixture: ComponentFixture<LogInOidcComponent>) {
    // use injector to get services
    const injector = fixture.debugElement.injector;
    const store = injector.get(Store);

    // add spies
    this.navigateSpy = spyOn(store, 'dispatch');
  }

}