import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { getTestScheduler } from 'jasmine-marbles';
import { TestScheduler } from 'rxjs/testing';
import { ConfigurationDataService } from '../../../core/data/configuration-data.service';
import { ConfigurationProperty } from '../../../core/shared/configuration-property.model';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { Item } from '../../../core/shared/item.model';
import { TranslateLoaderMock } from '../../mocks/translate-loader.mock';
import { createSuccessfulRemoteDataObject$ } from '../../remote-data.utils';
import { HideNotificationMenuComponent } from './hide-notification-menu.component';
import { of } from 'rxjs/internal/observable/of';
import { NotificationMenuService } from './notification-menu.service';

describe('HideNotificationMenuComponent', () => {
  let component: HideNotificationMenuComponent;
  let componentAsAny: any;
  let fixture: ComponentFixture<HideNotificationMenuComponent>;
  let scheduler: TestScheduler;
  let configurationDataService: any;
  let notificationMenuService: any;

  let dso: DSpaceObject;

  beforeEach(waitForAsync(() => {
    dso = Object.assign(new Item(), {
      id: 'test-item',
      metadata: {
        'relationship.type' : [
          {
            value: 'Notification'
          }
        ]
      },
      _links: {
        self: { href: 'test-item-selflink' }
      }
    });

    configurationDataService = jasmine.createSpyObj('ConfigurationDataService', {
      findByPropertyName: createSuccessfulRemoteDataObject$(Object.assign(new ConfigurationProperty(), {
        values: ['933dfdbe-e9eb-4537-85ad-0f5c8b2dd11b']
      }))
    });

    notificationMenuService = jasmine.createSpyObj('NotificationMenuService', {
      isHiddenObs: of(true),
      showNotification: createSuccessfulRemoteDataObject$({}),
      hideNotification: createSuccessfulRemoteDataObject$({})
    });

    TestBed.configureTestingModule({
      declarations: [ HideNotificationMenuComponent ],
      imports: [
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      providers: [
        { provide: 'contextMenuObjectProvider', useValue: dso },
        { provide: 'contextMenuObjectTypeProvider', useValue: DSpaceObjectType.ITEM },
        { provide: ConfigurationDataService, useValue: configurationDataService}
      ]
    });

    TestBed.overrideComponent(HideNotificationMenuComponent, {
      set: {
        providers: [
          { provide: NotificationMenuService, useValue: notificationMenuService }
        ]
      }
    });
  }));

  beforeEach(() => {
    scheduler = getTestScheduler();
    fixture = TestBed.createComponent(HideNotificationMenuComponent);
    component = fixture.componentInstance;
    componentAsAny = fixture.componentInstance;
    component.contextMenuObject = dso;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('when notification is shown should render an hide button', (done) => {

    component.isHidden$ = of(false);

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const showBtn = fixture.debugElement.query(By.css('button'));
      expect(showBtn).not.toBeNull();
      expect(showBtn.nativeElement.id).toEqual('showBtn');
      done();
    });

  });

  it('when notification is shown should render an hide button', (done) => {

    component.isHidden$ = of(true);

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const hideBtn = fixture.debugElement.query(By.css('button'));
      expect(hideBtn).not.toBeNull();
      expect(hideBtn.nativeElement.id).toEqual('hideBtn');
      done();
    });
  });

  it('when user click on show notification should call service showNotification', () => {

    component.show();

    expect(notificationMenuService.showNotification).toHaveBeenCalled();

  });

  it('when user click on show notification should call service showNotification', () => {

    component.hide();

    expect(notificationMenuService.hideNotification).toHaveBeenCalled();

  });

});
