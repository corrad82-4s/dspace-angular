import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
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

describe('InstitutionExploreComponent', () => {

  let component: InstitutionExploreComponent;
  let fixture: ComponentFixture<InstitutionExploreComponent>;
  let institutionService: InstitutionDataService;
  let collectionService: any;
  let requestService: any;

  const firstInstitution = Object.assign(new Community(), {
    name: 'First Institution',
    id: '123456',
    metadata: {
      'perucris.community.institutional-scoped-role' : [
        {
          value: 'Institutional Role A: First Institution',
          authority: '1993322'
        },
        {
          value: 'Institutional Role B: First Institution',
          authority: '5453362'
        }
      ]
    }
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
      imports: [CommonModule, NgbModule, FormsModule, ReactiveFormsModule, BrowserModule, RouterTestingModule,
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

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(InstitutionExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
  }));

  it('should create InstitutionExploreComponent', inject([InstitutionExploreComponent], (comp: InstitutionExploreComponent) => {
    expect(comp).toBeDefined();
  }));

  it('should show all the institutions', fakeAsync(() => {
    const institutionList = fixture.debugElement.query(By.css('#institutionList'));
    expect(institutionList.children.length).toEqual(2);
    const firstInstitutionLink = institutionList.children[0].children[0];
    expect(firstInstitutionLink.nativeElement.textContent.trim()).toEqual('First Institution');
    const secondInstitutionLink = institutionList.children[1].children[0];
    expect(secondInstitutionLink.nativeElement.textContent.trim()).toEqual('Second Institution');
  }))

  describe('when clicking on one instituion', () => {

    beforeEach(fakeAsync(() => {
      const institutionList = fixture.debugElement.query(By.css('#institutionList'));
      const firstInstitutionLink = institutionList.children[0].children[0];
      firstInstitutionLink.triggerEventHandler('click', {});
      fixture.detectChanges();
      tick();
    }));

    it('should open the detail section', fakeAsync(() => {
      expect(firstInstitution.id).toEqual(component.currentInstitution.id);
      const institutionDetailSection = fixture.debugElement.query(By.css('#institutionDetailSection'));
      expect(institutionDetailSection).not.toBeNull();
    }));

    it('should show the institution link in the detail section', fakeAsync(() => {
      const institutionLink = fixture.debugElement.query(By.css('#institutionLink'));
      expect(institutionLink.nativeElement.textContent.trim()).toEqual('First Institution');
      expect(institutionLink.nativeElement.href).toContain('/communities/123456');
    }));

    it('should show the sub collection links in the detail section', fakeAsync(() => {
      const entityList = fixture.debugElement.query(By.css('#entityList'));

      const firstEntityLink = entityList.children[0].children[0];
      expect(firstEntityLink.nativeElement.textContent.trim()).toEqual('First Collection');
      expect(firstEntityLink.nativeElement.href).toContain('/collections/22-123456');

      const secondEntityLink = entityList.children[1].children[0];
      expect(secondEntityLink.nativeElement.textContent.trim()).toEqual('Second Collection');
      expect(secondEntityLink.nativeElement.href).toContain('/collections/11-987654');
    }));

    it('should show the institutional scoped role links in the detail section', fakeAsync(() => {
      const roleList = fixture.debugElement.query(By.css('#roleList'));

      const firstRoleLink = roleList.children[0].children[0];
      expect(firstRoleLink.nativeElement.textContent.trim()).toEqual('Institutional Role A: First Institution');
      expect(firstRoleLink.nativeElement.href).toContain('/admin/access-control/groups/1993322');

      const secondRoleLink = roleList.children[1].children[0];
      expect(secondRoleLink.nativeElement.textContent.trim()).toEqual('Institutional Role B: First Institution');
      expect(secondRoleLink.nativeElement.href).toContain('/admin/access-control/groups/5453362');
    }));

  })

});
