import { ActivatedRoute, Router } from '@angular/router';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { TestScheduler } from 'rxjs/testing';
import { getTestScheduler } from 'jasmine-marbles';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

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
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ProfilePageVerifiedIdentifiersComponent } from './profile-page-verified-identifiers.component';
import { By } from '@angular/platform-browser';

describe('ProfilePageVerifiedIdentifiersComponent', () => {
  let scheduler: TestScheduler;
  let component: ProfilePageVerifiedIdentifiersComponent;
  let componentAsAny: any;
  let fixture: ComponentFixture<ProfilePageVerifiedIdentifiersComponent>;

  const ePersonDataService = jasmine.createSpyObj('ePersonDataService', {
    patch: jasmine.createSpy('patch'),
  });
  const mockEPerson: EPerson = Object.assign(new EPerson(), {
    id: '4bbc98f0-3bf0-461d-91ce-d46082fcc239',
    uuid: '4bbc98f0-3bf0-461d-91ce-d46082fcc239',
    email: 'matteo.perelli@4science.it',
    handle: null,
    metadata: {
      'perucris.eperson.orcid': [{
        value: 'my-orcid',
        language: null,
        authority: null,
        confidence: -1,
        place: 0,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }],
      'perucris.eperson.dni': [{
        value: 'my-dni',
        language: null,
        authority: null,
        confidence: -1,
        place: 0,
        uuid: '',
        isVirtual: false,
        virtualValue: ''
      }],
    }
  });

  const mockEPersonWithoutIdentifier: EPerson = Object.assign(new EPerson(), {
    id: '4bbc98f0-3bf0-461d-91ce-d46082fcc239',
    uuid: '4bbc98f0-3bf0-461d-91ce-d46082fcc239',
    email: 'matteo.perelli@4science.it',
    handle: null,
    metadata: {}
  });

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        NgxPaginationModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        EnumKeysPipe,
        PaginationComponent,
        ProfilePageVerifiedIdentifiersComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: HostWindowService, useValue: new HostWindowServiceStub(0) },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: EPersonDataService, useValue: ePersonDataService },
        { provide: Router, useValue: new RouterStub() },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    scheduler = getTestScheduler();
    fixture = TestBed.createComponent(ProfilePageVerifiedIdentifiersComponent);
    component = fixture.componentInstance;
    component.user = mockEPerson;
    componentAsAny = component;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // --------
  // @ Orcid

  it('should display verified orcid when present', () => {
    fixture.detectChanges();
    const orcidEl = fixture.debugElement.query(By.css('#orcid'));
    expect(orcidEl.nativeElement.innerHTML).toBe('my-orcid');
  });

  it('should not display verified orcid when not present', () => {
    component.user = mockEPersonWithoutIdentifier;
    fixture.detectChanges();
    const orcidEl = fixture.debugElement.query(By.css('#orcid'));
    expect(orcidEl).toBeNull();
  });

  // --------
  // @ Dni


  it('should display verified dni when present', () => {
    fixture.detectChanges();
    const dniEl = fixture.debugElement.query(By.css('#dni'));
    expect(dniEl.nativeElement.innerHTML).toBe('my-dni');
  });

  it('should not display verified dni when not present', () => {
    component.user = mockEPersonWithoutIdentifier;
    fixture.detectChanges();
    const dniEl = fixture.debugElement.query(By.css('#dni'));
    expect(dniEl).toBeNull();
  });



});
