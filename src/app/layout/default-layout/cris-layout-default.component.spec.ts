import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, ComponentFactoryResolver, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestScheduler } from 'rxjs/testing';

import { cold, getTestScheduler, hot } from 'jasmine-marbles';
import { of as observableOf } from 'rxjs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { CrisLayoutDefaultComponent } from './cris-layout-default.component';
import { LayoutPage } from '../enums/layout-page.enum';
import { PaginatedList } from '../../core/data/paginated-list';
import { createSuccessfulRemoteDataObject } from '../../shared/remote-data.utils';
import { PageInfo } from '../../core/shared/page-info.model';
import { tabPersonProfile, tabPersonTest, tabs } from '../../shared/testing/tab.mock';
import { TabDataService } from '../../core/layout/tab-data.service';
import { CrisLayoutDefaultTabComponent } from './tab/cris-layout-default-tab.component';
import * as CrisLayoutTabDecorators from '../decorators/cris-layout-tab.decorator';
import { Item } from '../../core/shared/item.model';
import { spyOnExported } from '../../shared/testing/utils.test';
import { TranslateLoaderMock } from '../../shared/mocks/translate-loader.mock';
import { CrisLayoutLoaderDirective } from '../directives/cris-layout-loader.directive';
import { EditItemDataService } from '../../core/submission/edititem-data.service';
import { EditItem } from '../../core/submission/models/edititem.model';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { AuthService } from '../../core/auth/auth.service';
import { BoxDataService } from '../../core/layout/box-data.service';
import {ResearcherProfileService} from '../../core/profile/researcher-profile.service';
import {NotificationsService} from '../../shared/notifications/notifications.service';

const testType = LayoutPage.DEFAULT;

const mockItem = Object.assign(new Item(), {
  id: 'fake-id',
  handle: 'fake/handle',
  lastModified: '2018',
  metadata: {
    'dc.title': [
      {
        language: null,
        value: 'test'
      }
    ],
    'relationship.type': [
      {
        language: null,
        value: testType
      }
    ]
  }
});

const tabDataServiceMock: any = jasmine.createSpyObj('TabDataService', {
  findByItem: jasmine.createSpy('findByItem')
});

const boxDataServiceMock: any = jasmine.createSpyObj('BoxDataService', {
  findByItem: jasmine.createSpy('findByItem')
});

const editItem: EditItem = Object.assign({
  modes: observableOf({})
});

const editItemDataServiceMock: any = jasmine.createSpyObj('EditItemDataService', {
  findById: jasmine.createSpy('findById')
});

const authorizationDataServiceMock: any = jasmine.createSpyObj('AuthorizationDataService', {
  isAuthorized: jasmine.createSpy('isAuthorized')
});

const authServiceMock: any = jasmine.createSpyObj('AuthService', {
  isAuthenticated: jasmine.createSpy('isAuthenticated')
});

const researcherProfileServiceMock: any = jasmine.createSpyObj('ResearcherProfileService', {
  createFromExternalSource: jasmine.createSpy('createFromExternalSources'),
  findRelatedItemId: jasmine.createSpy('findRelatedItemId')
});

const routerMock: any = jasmine.createSpyObj('Router', {
  navigateByUrl: jasmine.createSpy('navigateByUrl')
});

const notificationServiceMock: any = jasmine.createSpyObj('NotificationsService', {
  navigateByUrl: jasmine.createSpy('navigateByUrl')
});

describe('CrisLayoutDefaultComponent', () => {
  let component: CrisLayoutDefaultComponent;
  let fixture: ComponentFixture<CrisLayoutDefaultComponent>;
  let scheduler: TestScheduler;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      }), BrowserAnimationsModule],
      declarations: [CrisLayoutDefaultComponent, CrisLayoutDefaultTabComponent, CrisLayoutLoaderDirective],
      providers: [
        ComponentFactoryResolver,
        { provide: BoxDataService, useValue: boxDataServiceMock },
        { provide: TabDataService, useValue: tabDataServiceMock },
        { provide: EditItemDataService, useValue: editItemDataServiceMock },
        { provide: AuthorizationDataService, useValue: authorizationDataServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: ComponentFactoryResolver, useValue: {} },
        { provide: ResearcherProfileService, useValue: researcherProfileServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationsService, useValue: notificationServiceMock },
        ChangeDetectorRef
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(CrisLayoutDefaultComponent, {
      set: {
        entryComponents: [CrisLayoutDefaultTabComponent]
      }
    }).compileComponents();
  }));

  beforeEach(() => {
    scheduler = getTestScheduler();
    fixture = TestBed.createComponent(CrisLayoutDefaultComponent);
    component = fixture.componentInstance;
    component.item = mockItem;
    spyOnExported(CrisLayoutTabDecorators, 'getCrisLayoutTab').and.returnValue(CrisLayoutDefaultTabComponent);
    editItemDataServiceMock.findById.and.returnValue(cold('a|', {
      a: createSuccessfulRemoteDataObject(
        editItem
      )
    }));
    boxDataServiceMock.findByItem.and.returnValue(cold('a|', {
      a: createSuccessfulRemoteDataObject(
        editItem
      )
    }));
    authorizationDataServiceMock.isAuthorized.and.returnValue(observableOf(true))
    authServiceMock.isAuthenticated.and.returnValue(observableOf(true))
  });

  afterEach(() => {
    scheduler = null;
    component = null;
  })

  describe('When the component is rendered with more then one tab', () => {
    beforeEach(() => {
      tabDataServiceMock.findByItem.and.returnValue(cold('a|', {
        a: createSuccessfulRemoteDataObject(
          new PaginatedList(new PageInfo(), tabs)
        )
      }))
    });

    it('should init component properly', (done) => {
      scheduler.schedule(() => component.ngOnInit());
      scheduler.flush();

      expect(component.getTabs()).toBeObservable(hot('-(a|)', {
        a: tabs
      }));

      expect(component.hasSidebar()).toBeObservable(hot('--(a|)', {
        a: true
      }));

      done();
    });

    it('should call the getCrisLayoutPage function with the right types', (done) => {
      scheduler.schedule(() => component.ngOnInit());
      scheduler.flush();
      component.changeTab(tabPersonTest);
      expect(CrisLayoutTabDecorators.getCrisLayoutTab).toHaveBeenCalledWith(mockItem, tabPersonTest.shortname);

      done();
    });

    it('check sidebar hide/show function', (done) => {
      scheduler.schedule(() => component.ngOnInit());
      scheduler.flush();
      expect((component as any).sidebarStatus$.value).toBeTrue();
      component.toggleSidebar();
      expect((component as any).sidebarStatus$.value).toBeFalse();
      component.toggleSidebar();

      done();
    });

    it('check if sidebar and its control are showed', (done) => {
      scheduler.schedule(() => component.ngOnInit());
      scheduler.flush();
      const sidebarControl$ = component.isSideBarHidden();
      expect(sidebarControl$).toBeObservable(hot('-a', {
        a: false
      }));

      done();
    });
  });

  describe('When the component is rendered with only one tab', () => {

    beforeEach(() => {
      tabDataServiceMock.findByItem.and.returnValue(cold('a|', {
        a: createSuccessfulRemoteDataObject(
          new PaginatedList(new PageInfo(), [tabPersonProfile])
        )
      }))
    });

    it('check if sidebar and its control are hidden', (done) => {
      scheduler.schedule(() => component.ngOnInit());
      scheduler.flush();
      const sidebarControl$ = component.isSideBarHidden();
      expect(sidebarControl$).toBeObservable(hot('-a', {
        a: true
      }));

      expect(component.hasSidebar()).toBeObservable(hot('--(a|)', {
        a: false
      }));

      done();
    });
  });

});
