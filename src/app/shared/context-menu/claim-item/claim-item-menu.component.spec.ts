import { createSuccessfulRemoteDataObject, createSuccessfulRemoteDataObject$ } from 'src/app/shared/remote-data.utils';
import { of as observableOf } from 'rxjs/internal/observable/of';
import { getTestScheduler } from 'jasmine-marbles';
import { NotificationsService } from './../../notifications/notifications.service';
import { ResearcherProfileService } from 'src/app/core/profile/researcher-profile.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimItemMenuComponent } from './claim-item-menu.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../testing/translate-loader.mock';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { Item } from 'src/app/core/shared/item.model';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { RouterTestingModule } from '@angular/router/testing';
import { TestScheduler } from 'rxjs/internal/testing/TestScheduler';
import { By } from '@angular/platform-browser';

describe('ClaimItemMenuComponent', () => {
  let component: ClaimItemMenuComponent;
  let componentAsAny: any;
  let fixture: ComponentFixture<ClaimItemMenuComponent>;
  let scheduler: TestScheduler;

  let dso: DSpaceObject;
  let authorizationService: any;
  let researcherProfileService: any;

  beforeEach(async(() => {

    dso = Object.assign(new Item(), {
      id: 'test-collection',
      _links: {
        self: { href: 'test-collection-selflink' }
      }
    });
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: jasmine.createSpy('isAuthorized')
    });
    researcherProfileService = jasmine.createSpyObj('researcherProfileService', {
      createFromExternalSource: jasmine.createSpy('createFromExternalSource')
    })
    TestBed.configureTestingModule({
      declarations: [ ClaimItemMenuComponent ],
      imports: [
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      })],
      providers: [
        { provide: 'contextMenuObjectProvider', useValue: dso },
        { provide: 'contextMenuObjectTypeProvider', useValue: DSpaceObjectType.ITEM },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: ResearcherProfileService, useValue: researcherProfileService },
        { provide: NotificationsService, useValue: {} }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    scheduler = getTestScheduler();
    fixture = TestBed.createComponent(ClaimItemMenuComponent);
    component = fixture.componentInstance;
    componentAsAny = fixture.componentInstance;
    component.contextMenuObject = dso;  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the user can claim the item', () => {
    beforeEach(() => {
      authorizationService.isAuthorized.and.returnValue(observableOf(true));
      fixture.detectChanges();
    });

    it('should render a button', () => {
      const link = fixture.debugElement.query(By.css('button'));
      expect(link).not.toBeNull();
    });

  });

  describe('when the user cannot claim the item', () => {
    beforeEach(() => {
      authorizationService.isAuthorized.and.returnValue(observableOf(false));
      fixture.detectChanges();
    });

    it('should not render a button', () => {
      const link = fixture.debugElement.query(By.css('button'));
      expect(link).toBeNull();
    });
  });

});
