import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { PaginatedList } from 'src/app/core/data/paginated-list';
import { RequestService } from 'src/app/core/data/request.service';
import { InstitutionDataService } from 'src/app/core/institution/institution-data.service';
import { Collection } from 'src/app/core/shared/collection.model';
import { Community } from 'src/app/core/shared/community.model';
import { HALLink } from 'src/app/core/shared/hal-link.model';
import { PageInfo } from 'src/app/core/shared/page-info.model';
import { getMockRequestService } from 'src/app/shared/mocks/request.service.mock';
import { TranslateLoaderMock } from 'src/app/shared/mocks/translate-loader.mock';
import { createSuccessfulRemoteDataObject$ } from 'src/app/shared/remote-data.utils';
import { InstitutionExploreComponent } from './institution-explore.component';

fdescribe('InstitutionExploreComponent', () => {

  let component: InstitutionExploreComponent;
  let fixture: ComponentFixture<InstitutionExploreComponent>;
  let institutionService: InstitutionDataService;
  let collectionService: any;
  let requestService: any;

  const firstInstitution = Object.assign(new Community(), {
    name: 'First Institution',
    id: '123456'
  });

  const secondInstitution = Object.assign(new Community(), {
    name: 'Second Institution',
    id: '987654'
  });

  const firstCollection = Object.assign(new Collection(), {
    name: 'First Collection',
    id: '22-123456'
  });

  const secondCollection = Object.assign(new Collection(), {
    name: 'Second Collection',
    id: '11-987654'
  });

  const pageInfo: PageInfo = Object.assign(new PageInfo(), {
    _links: {
      self: new HALLink()
    }
  });

  beforeEach(() => {
    requestService = getMockRequestService();
    collectionService = jasmine.createSpyObj('collectionDataService', {
      findByParent: createSuccessfulRemoteDataObject$(new PaginatedList(pageInfo, [firstCollection, secondCollection]))
    });
    institutionService = jasmine.createSpyObj('institutionDataService', {
      findAll: createSuccessfulRemoteDataObject$(new PaginatedList(pageInfo, [firstInstitution, secondInstitution]))
    });

    TestBed.configureTestingModule({
      imports: [CommonModule, NgbModule, FormsModule, ReactiveFormsModule, BrowserModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        }),
      ],
      declarations: [InstitutionExploreComponent],
      providers: [InstitutionExploreComponent,
        { provide: InstitutionDataService, useValue: institutionService },
        { provide: CollectionDataService, useValue: collectionService },
        { provide: RequestService, useValue: requestService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstitutionExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create InstitutionExploreComponent', inject([InstitutionExploreComponent], (comp: InstitutionExploreComponent) => {
    expect(comp).toBeDefined();
  }));

});
