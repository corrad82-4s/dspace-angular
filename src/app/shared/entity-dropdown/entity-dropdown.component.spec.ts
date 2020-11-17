import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EntityDropdownComponent } from './entity-dropdown.component';
import { PaginatedList } from 'src/app/core/data/paginated-list';
import { getTestScheduler } from 'jasmine-marbles';
import { createSuccessfulRemoteDataObject$ } from '../remote-data.utils';
import { PageInfo } from 'src/app/core/shared/page-info.model';
import { ItemType } from '../../core/shared/item-relationships/item-type.model';
import { ChangeDetectorRef, ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { EntityTypeService } from '../../core/data/entity-type.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../mocks/translate-loader.mock';
import { TestScheduler } from 'rxjs/testing';
import { By } from '@angular/platform-browser';

const entities: ItemType[] = [
  Object.assign(new ItemType(), {
    id: 'ce64f48e-2c9b-411a-ac36-ee429c0e6a88',
    label: 'Entity 1',
    uuid: 'UUID-ce64f48e-2c9b-411a-ac36-ee429c0e6a88'
  }),
  Object.assign(new ItemType(), {
    id: '59ee713b-ee53-4220-8c3f-9860dc84fe33',
    label: 'Entity 2',
    uuid: 'UUID-59ee713b-ee53-4220-8c3f-9860dc84fe33'
  }),
  Object.assign(new ItemType(), {
    id: 'e9dbf393-7127-415f-8919-55be34a6e9ed',
    label: 'Entity 3',
    uuid: 'UUID-7127-415f-8919-55be34a6e9ed'
  }),
  Object.assign(new ItemType(), {
    id: '59da2ff0-9bf4-45bf-88be-e35abd33f304',
    label: 'Entity 4',
    uuid: 'UUID-59da2ff0-9bf4-45bf-88be-e35abd33f304'
  }),
  Object.assign(new ItemType(), {
    id: 'a5159760-f362-4659-9e81-e3253ad91ede',
    label: 'Entity 5',
    uuid: 'UUID-a5159760-f362-4659-9e81-e3253ad91ede'
  })
];

const listElementMock: ItemType = Object.assign(
  new ItemType(), {
    id: 'ce64f48e-2c9b-411a-ac36-ee429c0e6a88',
    label: 'Entity 1',
    uuid: 'UUID-ce64f48e-2c9b-411a-ac36-ee429c0e6a88'
  }
);

describe('EntityDropdownComponent', () => {
  let component: EntityDropdownComponent;
  let componentAsAny: any;
  let fixture: ComponentFixture<EntityDropdownComponent>;
  let scheduler: TestScheduler;

  const entityTypeServiceMock: any = jasmine.createSpyObj('EntityTypeService', {
    getAllAuthorizedRelationshipType: jasmine.createSpy('getAllAuthorizedRelationshipType'),
    getAllAuthorizedRelationshipTypeImport: jasmine.createSpy('getAllAuthorizedRelationshipTypeImport')
  });

  const paginatedEntities = new PaginatedList(new PageInfo(), entities);
  const paginatedEntitiesRD$ = createSuccessfulRemoteDataObject$(paginatedEntities);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      declarations: [ EntityDropdownComponent ],
      providers: [
        {provide: EntityTypeService, useValue: entityTypeServiceMock},
        {provide: ElementRef, userValue: {}},
        ChangeDetectorRef
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    scheduler = getTestScheduler();
    fixture = TestBed.createComponent(EntityDropdownComponent);
    component = fixture.componentInstance;
    componentAsAny = fixture.componentInstance;
    componentAsAny.entityTypeService.getAllAuthorizedRelationshipType.and.returnValue(paginatedEntitiesRD$);
    componentAsAny.entityTypeService.getAllAuthorizedRelationshipTypeImport.and.returnValue(paginatedEntitiesRD$);
    component.isSubmission = true;
  });

  it('should init component with entities list', () => {
    spyOn(component.subs, 'push');
    spyOn(component, 'resetPagination');
    spyOn(component, 'populateEntityList').and.callThrough();

    scheduler.schedule(() => fixture.detectChanges());
    scheduler.flush();
    const elements = fixture.debugElement.queryAll(By.css('.entity-item'));

    expect(elements.length).toEqual(5);
    expect(component.subs.push).toHaveBeenCalled();
    expect(component.resetPagination).toHaveBeenCalled();
    expect(component.populateEntityList).toHaveBeenCalled();
    expect((component as any).entityTypeService.getAllAuthorizedRelationshipType).toHaveBeenCalled();
  });

  it('should trigger onSelect method when select a new entity from list', () => {
    scheduler.schedule(() => fixture.detectChanges());
    scheduler.flush();

    spyOn(component, 'onSelect');
    const entityItem = fixture.debugElement.query(By.css('.entity-item:nth-child(2)'));
    entityItem.triggerEventHandler('click', null);

    scheduler.schedule(() => fixture.detectChanges());
    scheduler.flush();

    expect(component.onSelect).toHaveBeenCalled();
  });

  it('should emit selectionChange event when selecting a new entity', () => {
    spyOn(component.selectionChange, 'emit').and.callThrough();
    component.ngOnInit();
    component.onSelect(listElementMock as any);
    fixture.detectChanges();

    expect(component.selectionChange.emit).toHaveBeenCalledWith(listElementMock as any);
  });

  it('should change loader status', () => {
    spyOn(component.isLoadingList, 'next').and.callThrough();
    component.hideShowLoader(true);

    expect(component.isLoadingList.next).toHaveBeenCalledWith(true);
  });

  it('reset pagination fields', () => {
    component.resetPagination();

    expect(component.currentPage).toEqual(1);
    expect(component.hasNextPage).toEqual(true);
    expect(component.searchListEntity).toEqual([]);
  });

  it('should invoke the method getAllAuthorizedRelationshipTypeImport of EntityTypeService when isSubmission is false', () => {
    component.isSubmission = false;

    scheduler.schedule(() => fixture.detectChanges());
    scheduler.flush();

    expect((component as any).entityTypeService.getAllAuthorizedRelationshipTypeImport).toHaveBeenCalled();
  });
});
