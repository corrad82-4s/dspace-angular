import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs/internal/observable/of';
import { CvEntity } from 'src/app/core/profile/model/cv-entity.model';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { CvEntityService } from '../../../core/profile/cv-entity.service';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { Item } from '../../../core/shared/item.model';
import { TranslateLoaderMock } from '../../mocks/translate-loader.mock';
import { ModifyForProfileMenuComponent } from './modify-for-profile-menu.component';

describe('ModifyForProfileMenuComponent', () => {
  let component: ModifyForProfileMenuComponent;
  let componentAsAny: any;
  let fixture: ComponentFixture<ModifyForProfileMenuComponent>;
  let authorizationService: any;
  let cvEntityService: any;
  let router: any;

  let dso: DSpaceObject;

  let cvEntity: CvEntity;

  beforeEach(waitForAsync(() => {
    dso = Object.assign(new Item(), {
      id: 'b6cc1a60-8eaa-4abd-bcf2-ed282fae10ee',
      metadata: {
        'relationship.type' : [
          {
            value: 'Publication'
          }
        ]
      },
      _links: {
        self: { href: 'test-item-selflink' }
      }
    });

    cvEntity = Object.assign(new CvEntity(), {
      id: 'f605441c-0aac-4112-bd77-49f7d672add5'
    });

    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: jasmine.createSpy('isAuthorized')
    });

    cvEntityService = jasmine.createSpyObj('cvEntityService', {
      create: jasmine.createSpy('create')
    });

    router = jasmine.createSpyObj('router', {
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    });

    TestBed.configureTestingModule({
      declarations: [ ModifyForProfileMenuComponent ],
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
        { provide: AuthorizationDataService, useValue: authorizationService},
        { provide: CvEntityService, useValue: cvEntityService},
        { provide: Router, useValue: router}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    authorizationService.isAuthorized.and.returnValue(of(true));
    fixture = TestBed.createComponent(ModifyForProfileMenuComponent);
    component = fixture.componentInstance;
    componentAsAny = fixture.componentInstance;
    component.contextMenuObject = dso;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a button', () => {
    const link = fixture.debugElement.query(By.css('button'));
    expect(link).not.toBeNull();
  });

  it('should create a new cv entity and redirect to item page', fakeAsync(() => {

    cvEntityService.create.and.returnValue(of(cvEntity));

    component.modify();
    tick();

    expect(cvEntityService.create).toHaveBeenCalledWith('b6cc1a60-8eaa-4abd-bcf2-ed282fae10ee');
    expect(router.navigateByUrl).toHaveBeenCalledWith('items/f605441c-0aac-4112-bd77-49f7d672add5');

  }));

});
