import { ChangeDetectionStrategy, Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';

import { of as observableOf } from 'rxjs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { TranslateLoaderMock } from '../../mocks/translate-loader.mock';
import { RouterStub } from '../../testing/router.stub';
import { Item } from '../../../core/shared/item.model';
import { ItemActionsComponent } from './item-actions.component';
import { ItemDataService } from '../../../core/data/item-data.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationsServiceStub } from '../../testing/notifications-service.stub';
import { RequestService } from '../../../core/data/request.service';
import { getMockSearchService } from '../../mocks/search-service.mock';
import { getMockRequestService } from '../../mocks/request.service.mock';
import { SearchService } from '../../../core/shared/search/search.service';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { RelationshipService } from '../../../core/data/relationship.service';
import { SubmissionService } from '../../../submission/submission.service';

let component: ItemActionsComponent;
let fixture: ComponentFixture<ItemActionsComponent>;

let mockObject: Item;

const mockDataService = {};

mockObject = Object.assign(new Item(), {
  bundles: observableOf({}),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title'
      }
    ],
    'dc.type': [
      {
        language: null,
        value: 'Article'
      }
    ],
    'dc.contributor.author': [
      {
        language: 'en_US',
        value: 'Smith, Donald'
      }
    ],
    'dc.date.issued': [
      {
        language: null,
        value: '2015-06-26'
      }
    ]
  }
});

const searchService = getMockSearchService();

const requestServce = getMockRequestService();

let authorizationService;
let relationshipService;
let submissionService;

describe('ItemActionsComponent', () => {
  beforeEach(waitForAsync(() => {

    authorizationService = new AuthorizationDataService(null, null, null, null, null, null, null, null, null, null);
    relationshipService = new RelationshipService(null, null, null, null, null, null, null, null, null, null);
    submissionService = new SubmissionService(null, null, null, null, null, null, null, null, null, null);

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      declarations: [ItemActionsComponent],
      providers: [
        { provide: Injector, useValue: {} },
        { provide: Router, useValue: new RouterStub() },
        { provide: ItemDataService, useValue: mockDataService },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: RelationshipService, useValue: relationshipService },
        { provide: SubmissionService, useValue: submissionService },
        { provide: SearchService, useValue: searchService },
        { provide: RequestService, useValue: requestServce }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(ItemActionsComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemActionsComponent);
    component = fixture.componentInstance;
    component.object = mockObject;
    component.canUpdate = false;
    component.canWithdraw = false;
    component.canReinstate = false;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture = null;
    component = null;
  });

  it('should init object properly', () => {
    component.object = null;
    component.initObjects(mockObject);

    expect(component.object).toEqual(mockObject);
  });

});
