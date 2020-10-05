import { ActivatedRoute, Router } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { of as observableOf } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { getTestScheduler } from 'jasmine-marbles';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {
  EPERSON_GRANTED_METADATA,
  ProfilePageGrantedApplicationsComponent
} from './profile-page-granted-applications.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { EnumKeysPipe } from '../../shared/utils/enum-keys-pipe';
import { EPersonDataService } from '../../core/eperson/eperson-data.service';
import { ActivatedRouteStub } from '../../shared/testing/active-router.stub';
import { RouterStub } from '../../shared/testing/router.stub';
import { HostWindowService } from '../../shared/host-window.service';
import { HostWindowServiceStub } from '../../shared/testing/host-window-service.stub';
import { EPerson } from '../../core/eperson/models/eperson.model';
import { Metadata } from '../../core/shared/metadata.utils';
import { RestResponse } from '../../core/cache/response.models';
import { MetadataValue } from '../../core/shared/metadata.models';

describe('ProfilePageGrantedApplicationsComponent', () => {
  let scheduler: TestScheduler;
  let component: ProfilePageGrantedApplicationsComponent;
  let componentAsAny: any;
  let fixture: ComponentFixture<ProfilePageGrantedApplicationsComponent>;

  const ePersonDataService = jasmine.createSpyObj('ePersonDataService', {
    patch: jasmine.createSpy('patch'),
  });
  const mockEPerson: EPerson = Object.assign(new EPerson(), {
    id: '4bbc98f0-3bf0-461d-91ce-d46082fcc239',
    uuid: '4bbc98f0-3bf0-461d-91ce-d46082fcc239',
    email: 'matteo.perelli@4science.it',
    handle: null,
    metadata: {
      'dspace.agreements.cookies': [{
        value: '{\"authentication\":true,\"preferences\":true,\"acknowledgement\":true,\"google-analytics\":true}',
        language: null,
        authority: null,
        confidence: -1,
        place: 0,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }],
      'dspace.agreements.end-user': [{
        value: 'true',
        language: null,
        authority: null,
        confidence: -1,
        place: 0,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }],
      'eperson.language': [{
        value: 'en',
        language: null,
        authority: null,
        confidence: -1,
        place: 0,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }],
      'perucris.oidc.granted': [{
        value: '{\"id\":\"dc39e3a0-921e-4b0b-b10d-f528e63cc1bc\",\"clientName\":\"DSpace\",\"scopes\":\"openid\",\"clientId\":\"10\"}',
        language: null,
        authority: null,
        confidence: -1,
        place: 0,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }, {
        value: '{\"id\":\"ec9131b8-c583-4f28-b9fd-a6d73a178aa4\",\"clientName\":\"DSpace\",\"scopes\":\"openid\",\"clientId\":\"10\"}',
        language: null,
        authority: null,
        confidence: -1,
        place: 1,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }, {
        value: '{\"id\":\"ffba24b8-89ed-46c0-af76-c50990070757\",\"clientName\":\"ClientName\",\"scopes\":\"pgc-role, email, openid, profile\",\"clientId\":\"3\"}',
        language: null,
        authority: null,
        confidence: -1,
        place: 2,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }, {
        value: '{\"id\":\"ddcd731e-7b03-464a-bfca-faf63bc91538\",\"clientName\":\"ClientName\",\"scopes\":\"pgc-role, email, openid, profile\",\"clientId\":\"3\"}',
        language: null,
        authority: null,
        confidence: -1,
        place: 3,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }, {
        value: '{\"id\":\"8071b18c-ad45-4172-b5f7-92589721e252\",\"clientName\":\"ClientName\",\"scopes\":\"pgc-role, email, openid, profile\",\"clientId\":\"3\"}',
        language: null,
        authority: null,
        confidence: -1,
        place: 4,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }],
      'perucris.oidc.reject': [{
        value: '{\"id\":\"c304ac89-431c-4c84-9231-3f3aff6c1009\",\"clientName\":\"DSpace\",\"scopes\":\"openid\",\"clientId\":\"10\"}',
        language: null,
        authority: null,
        confidence: -1,
        place: 0,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }, {
        value: '{\"id\":\"4e1d9555-1c1c-4974-8b86-a0b358002fdf\",\"clientName\":\"DSpace\",\"scopes\":\"openid\",\"clientId\":\"10\"}',
        language: null,
        authority: null,
        confidence: -1,
        place: 1,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }]
    }
  });

  const applicationList = [
    {
      id: 'dc39e3a0-921e-4b0b-b10d-f528e63cc1bc',
      clientName: 'DSpace',
      clientId: '10',
      scopes: ['openid'],
      encodedValue: '{\"id\":\"dc39e3a0-921e-4b0b-b10d-f528e63cc1bc\",\"clientName\":\"DSpace\",\"scopes\":\"openid\",\"clientId\":\"10\"}',
      place: 0
    },
    {
      id: 'ec9131b8-c583-4f28-b9fd-a6d73a178aa4',
      clientName: 'DSpace',
      clientId: '10',
      scopes: ['openid'],
      encodedValue: '{\"id\":\"ec9131b8-c583-4f28-b9fd-a6d73a178aa4\",\"clientName\":\"DSpace\",\"scopes\":\"openid\",\"clientId\":\"10\"}',
      place: 1
    },
    {
      id: 'ffba24b8-89ed-46c0-af76-c50990070757',
      clientName: 'ClientName',
      clientId: '3',
      scopes: ['pgc-role', 'email', 'openid', 'profile'],
      encodedValue: '{\"id\":\"ffba24b8-89ed-46c0-af76-c50990070757\",\"clientName\":\"ClientName\",\"scopes\":\"pgc-role, email, openid, profile\",\"clientId\":\"3\"}',
      place: 2
    },
    {
      id: 'ddcd731e-7b03-464a-bfca-faf63bc91538',
      clientName: 'ClientName',
      clientId: '3',
      scopes: ['pgc-role', 'email', 'openid', 'profile'],
      encodedValue: '{\"id\":\"ddcd731e-7b03-464a-bfca-faf63bc91538\",\"clientName\":\"ClientName\",\"scopes\":\"pgc-role, email, openid, profile\",\"clientId\":\"3\"}',
      place: 3
    },
    {
      id: '8071b18c-ad45-4172-b5f7-92589721e252',
      clientName: 'ClientName',
      clientId: '3',
      scopes: ['pgc-role', 'email', 'openid', 'profile'],
      encodedValue: '{\"id\":\"8071b18c-ad45-4172-b5f7-92589721e252\",\"clientName\":\"ClientName\",\"scopes\":\"pgc-role, email, openid, profile\",\"clientId\":\"3\"}',
      place: 4
    }
  ]
  const metadataList = Metadata.all(mockEPerson.metadata, EPERSON_GRANTED_METADATA);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        NgxPaginationModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        EnumKeysPipe,
        PaginationComponent,
        ProfilePageGrantedApplicationsComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: HostWindowService, useValue: new HostWindowServiceStub(0) },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: EPersonDataService, useValue: ePersonDataService },
        { provide: Router, useValue: new RouterStub() }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    scheduler = getTestScheduler();
    fixture = TestBed.createComponent(ProfilePageGrantedApplicationsComponent);
    component = fixture.componentInstance;
    componentAsAny = component;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('with valid eperson', () => {
    beforeEach(() => {
      component.user = mockEPerson;
      fixture.detectChanges();
    });

    it('should init component properly', () => {
      spyOn(componentAsAny, 'buildApplicationListFromMetadata');
      scheduler.schedule(() => component.ngOnInit());
      scheduler.flush();

      expect(component.userUUID).toBe('4bbc98f0-3bf0-461d-91ce-d46082fcc239');
      expect(componentAsAny.buildApplicationListFromMetadata).toHaveBeenCalled();
    });

    it('should build application list from metadata', () => {
      componentAsAny.buildApplicationListFromMetadata(metadataList);
      expect(componentAsAny.applicationList$.value).toEqual(applicationList);
    });

    it('should get application as observable', () => {
      componentAsAny.buildApplicationListFromMetadata(metadataList);
      expect(component.getApplications()).toEqual(componentAsAny.applicationList$.asObservable());
    });

    it('should call revokePermission on revoke confirmation', (done) => {
      spyOn(componentAsAny, 'revokePermission');
      const modalBtn = fixture.debugElement.query(By.css('.btn-outline-primary'));

      modalBtn.nativeElement.click();
      fixture.detectChanges();

      const confirmBtn: any = ((document as any).querySelector('.btn-danger:nth-child(2)'));
      confirmBtn.click();

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(componentAsAny.revokePermission).toHaveBeenCalled();
        done();
      });
    });

    it('should revoke a permission properly when patch successful', () => {
      ePersonDataService.patch.and.returnValue(observableOf(new RestResponse(true, 200, 'OK')));
      const newMetadataList = metadataList
        .filter((metadata: MetadataValue) => metadata.place !== 2);
      scheduler.schedule(() => componentAsAny.revokePermission(2, '{\"id\":\"ffba24b8-89ed-46c0-af76-c50990070757\",\"clientName\":\"ClientName\",\"scopes\":\"pgc-role, email, openid, profile\",\"clientId\":\"3\"}'));
      scheduler.flush();

      expect(componentAsAny.grantedMetadataValues$.value).toEqual(newMetadataList);
    });

    it('should not revoke a permission properly when patch failed', () => {
      ePersonDataService.patch.and.returnValue(observableOf(new RestResponse(false, 403, 'FORBIDDEN')));
      scheduler.schedule(() => componentAsAny.revokePermission(2, '{\"id\":\"ffba24b8-89ed-46c0-af76-c50990070757\",\"clientName\":\"ClientName\",\"scopes\":\"pgc-role, email, openid, profile\",\"clientId\":\"3\"}'));
      scheduler.flush();

      expect(componentAsAny.notificationsService.error).toHaveBeenCalled();
    });
  })
});
