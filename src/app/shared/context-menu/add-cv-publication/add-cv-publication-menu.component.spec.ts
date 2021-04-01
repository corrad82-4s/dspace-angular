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
import { AddCvPublicationMenuComponent } from './add-cv-publication-menu.component';

describe('AddCvPublicationMenuComponent', () => {
  let component: AddCvPublicationMenuComponent;
  let componentAsAny: any;
  let fixture: ComponentFixture<AddCvPublicationMenuComponent>;
  let scheduler: TestScheduler;
  let configurationDataService: any;

  let dso: DSpaceObject;

  beforeEach(waitForAsync(() => {
    dso = Object.assign(new Item(), {
      id: 'test-item',
      metadata: {
        'relationship.type' : [
          {
            value: 'CvPerson'
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

    TestBed.configureTestingModule({
      declarations: [ AddCvPublicationMenuComponent ],
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
    }).compileComponents();
  }));

  beforeEach(() => {
    scheduler = getTestScheduler();
    fixture = TestBed.createComponent(AddCvPublicationMenuComponent);
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

});
