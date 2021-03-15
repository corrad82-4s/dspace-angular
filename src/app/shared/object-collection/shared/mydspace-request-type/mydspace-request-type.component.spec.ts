import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ItemDataService } from 'src/app/core/data/item-data.service';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RelationshipService } from 'src/app/core/data/relationship.service';
import { RemoteData } from 'src/app/core/data/remote-data';
import { Relationship } from 'src/app/core/shared/item-relationships/relationship.model';
import { Item } from 'src/app/core/shared/item.model';
import { WorkspaceItem } from 'src/app/core/submission/models/workspaceitem.model';
import { TranslateLoaderMock } from 'src/app/shared/mocks/translate-loader.mock';
import { createSuccessfulRemoteDataObject$ } from 'src/app/shared/remote-data.utils';
import { createPaginatedList } from 'src/app/shared/testing/utils.test';
import { MyDSpaceRequestTypeComponent } from './mydspace-request-type.component';

describe('MyDSpaceRequestTypeComponent', () => {
  let comp: MyDSpaceRequestTypeComponent;
  let fixture: ComponentFixture<MyDSpaceRequestTypeComponent>;

  const firstItemId = '143df7bf-82ab-4fe5-86ac-df0ae1b12347';
  const secondItemId = '5085e9b4-b855-42b8-b4ba-b86d86d1ffb4';
  const thirdItemId = '8cd3f413-2896-45a6-8e7f-0cf68ac5bf25';
  const fourthItemId = 'c72915a3-f9bd-4e8f-86e9-cd71a65bc1b5';

  const firstItem = Object.assign(new Item(), {
    id: firstItemId
  });

  const secondItem = Object.assign(new Item(), {
    id: secondItemId
  });

  const thirdItem = Object.assign(new Item(), {
    id: thirdItemId
  });

  const fourthItem = Object.assign(new Item(), {
    id: fourthItemId
  });

  const firstSubmissionObject = Object.assign( new WorkspaceItem(), {
    _links: {
      item: {
        href: 'items/' + firstItemId
      }
    }
  });

  const secondSubmissionObject = Object.assign( new WorkspaceItem(), {
    _links: {
      item: {
        href: 'items/' + secondItemId
      }
    }
  });

  const thirdSubmissionObject = Object.assign( new WorkspaceItem(), {
    _links: {
      item: {
        href: 'items/' + thirdItemId
      }
    }
  });

  const fourthSubmissionObject = Object.assign( new WorkspaceItem(), {
    _links: {
      item: {
        href: 'items/' + fourthItemId
      }
    }
  });

  const relationshipService = Object.assign(new Object(), {
    getItemRelationshipsByLabel(item: Item, relationship: string): Observable<RemoteData<PaginatedList<Relationship>>> {
      if (item.id === firstItemId && relationship === 'isCorrectionOfItem') {
        return createSuccessfulRemoteDataObject$(createPaginatedList([new Relationship()]));
      }
      if (item.id === secondItemId && relationship === 'isWithdrawOfItem') {
        return createSuccessfulRemoteDataObject$(createPaginatedList([new Relationship()]));
      }
      if (item.id === thirdItemId && relationship === 'isReinstatementOfItem') {
        return createSuccessfulRemoteDataObject$(createPaginatedList([new Relationship()]));
      }
      return createSuccessfulRemoteDataObject$(createPaginatedList());
    }
  }) as RelationshipService;

  const itemService = Object.assign(new Object(), {
    findByHref(href: string): Observable<RemoteData<Item>> {
      if (href === 'items/' + firstItemId) {
        return createSuccessfulRemoteDataObject$(firstItem);
      }
      if (href === 'items/' + secondItemId) {
        return createSuccessfulRemoteDataObject$(secondItem);
      }
      if (href === 'items/' + thirdItemId) {
        return createSuccessfulRemoteDataObject$(thirdItem);
      }
      if (href === 'items/' + fourthItemId) {
        return createSuccessfulRemoteDataObject$(fourthItem);
      }
    }
  }) as ItemDataService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ NgbModule, TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      declarations: [MyDSpaceRequestTypeComponent],
      providers: [
        {
          provide: RelationshipService,
          useValue: relationshipService
        },
        {
          provide: ItemDataService,
          useValue: itemService
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('should show the correction badge if the item has the isCorrectionOfItem relation', () => {
    fixture = TestBed.createComponent(MyDSpaceRequestTypeComponent);
    comp = fixture.componentInstance;
    comp.submissionObject = firstSubmissionObject;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.badge-primary'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-secondary'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-danger'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-success'))).toBeNull();
  });

  it('should show the withdraw badge if the item has the isWithdrawOfItem relation', () => {
    fixture = TestBed.createComponent(MyDSpaceRequestTypeComponent);
    comp = fixture.componentInstance;
    comp.submissionObject = secondSubmissionObject;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.badge-primary'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-secondary'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-danger'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-success'))).toBeNull();
  });

  it('should show the reinstate badge if the item has the isReinstatementOfItem relation', () => {
    fixture = TestBed.createComponent(MyDSpaceRequestTypeComponent);
    comp = fixture.componentInstance;
    comp.submissionObject = thirdSubmissionObject;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.badge-primary'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-secondary'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-danger'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-success'))).not.toBeNull();
  });

  it('should show the new submission badge if the item has not relations', () => {
    fixture = TestBed.createComponent(MyDSpaceRequestTypeComponent);
    comp = fixture.componentInstance;
    comp.submissionObject = fourthSubmissionObject;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.badge-primary'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-secondary'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-danger'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.badge-success'))).toBeNull();
  });

});
