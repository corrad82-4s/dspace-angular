import { Observable, of as observableOf } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { buildPaginatedList, PaginatedList } from '../../../../core/data/paginated-list.model';
import { Store } from '@ngrx/store';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { GroupDataService } from '../../../../core/eperson/group-data.service';
import { Group } from '../../../../core/eperson/models/group.model';
import { InstitutionalRoleGroupMock, InstitutionalScopedRoleGroupMock, InstitutionalScopedRoleGroupMock2, RoleGroupMock, RoleGroupMock2 } from 'src/app/shared/testing/group-mock';
import { AuthService } from '../../../../core/auth/auth.service';
import { RemoteDataBuildService } from '../../../../core/cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../../../core/cache/object-cache.service';
import { DSOChangeAnalyzer } from '../../../../core/data/dso-change-analyzer.service';
import { AuthorizationDataService } from '../../../../core/data/feature-authorization/authorization-data.service';
import { PaginatedList, buildPaginatedList } from '../../../../core/data/paginated-list.model';
import { RemoteData } from '../../../../core/data/remote-data';
import { FindListOptions } from '../../../../core/data/request.models';
import { EPersonDataService } from '../../../../core/eperson/eperson-data.service';
import { EPerson } from '../../../../core/eperson/models/eperson.model';
import { HALEndpointService } from '../../../../core/shared/hal-endpoint.service';
import { PageInfo } from '../../../../core/shared/page-info.model';
import { UUIDService } from '../../../../core/shared/uuid.service';
import { FormBuilderService } from '../../../../shared/form/builder/form-builder.service';
import { getMockFormBuilderService } from '../../../../shared/mocks/form-builder-service.mock';
import { TranslateLoaderMock } from '../../../../shared/mocks/translate-loader.mock';
import { getMockTranslateService } from '../../../../shared/mocks/translate.service.mock';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../shared/remote-data.utils';
import { AuthServiceStub } from '../../../../shared/testing/auth-service.stub';
import { EpersonRegistrationService } from 'src/app/core/data/eperson-registration.service';
import { EPersonMock, EPersonMock2 } from '../../../../shared/testing/eperson.mock';
import { NotificationsServiceStub } from '../../../../shared/testing/notifications-service.stub';
import { EPeopleRegistryComponent } from '../epeople-registry.component';
import { EPersonFormComponent } from './eperson-form.component';

describe('EPersonFormComponent', () => {
  let component: EPersonFormComponent;
  let fixture: ComponentFixture<EPersonFormComponent>;
  let translateService: TranslateService;
  let builderService: FormBuilderService;

  let mockEPeople;
  let ePersonDataServiceStub: any;
  let groupDataServiceStub: any;
  let authService: AuthServiceStub;
  let authorizationService: AuthorizationDataService;
  let epersonRegistrationService: EpersonRegistrationService;

  beforeEach(waitForAsync(() => {
    mockEPeople = [EPersonMock, EPersonMock2];
    ePersonDataServiceStub = {
      activeEPerson: null,
      allEpeople: mockEPeople,
      getEPeople(): Observable<RemoteData<PaginatedList<EPerson>>> {
        return createSuccessfulRemoteDataObject$(buildPaginatedList(null, this.allEpeople));
      },
      getActiveEPerson(): Observable<EPerson> {
        return observableOf(this.activeEPerson);
      },
      searchByScope(scope: string, query: string, options: FindListOptions = {}): Observable<RemoteData<PaginatedList<EPerson>>> {
        if (scope === 'email') {
          const result = this.allEpeople.find((ePerson: EPerson) => {
            return ePerson.email === query;
          });
          return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [result]));
        }
        if (scope === 'metadata') {
          if (query === '') {
            return createSuccessfulRemoteDataObject$(buildPaginatedList(null, this.allEpeople));
          }
          const result = this.allEpeople.find((ePerson: EPerson) => {
            return (ePerson.name.includes(query) || ePerson.email.includes(query));
          });
          return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [result]));
        }
        return createSuccessfulRemoteDataObject$(buildPaginatedList(null, this.allEpeople));
      },
      deleteEPerson(ePerson: EPerson): Observable<boolean> {
        this.allEpeople = this.allEpeople.filter((ePerson2: EPerson) => {
          return (ePerson2.uuid !== ePerson.uuid);
        });
        return observableOf(true);
      },
      create(ePerson: EPerson): Observable<RemoteData<EPerson>> {
        this.allEpeople = [...this.allEpeople, ePerson];
        return createSuccessfulRemoteDataObject$(ePerson);
      },
      editEPerson(ePerson: EPerson) {
        this.activeEPerson = ePerson;
      },
      cancelEditEPerson() {
        this.activeEPerson = null;
      },
      clearEPersonRequests(): void {
        // empty
      },
      updateEPerson(ePerson: EPerson): Observable<RemoteData<EPerson>> {
        this.allEpeople.forEach((ePersonInList: EPerson, i: number) => {
          if (ePersonInList.id === ePerson.id) {
            this.allEpeople[i] = ePerson;
          }
        });
        return createSuccessfulRemoteDataObject$(ePerson);
      }
    };

    groupDataServiceStub = {
      searchGroups(query: string): Observable<RemoteData<PaginatedList<Group>>> {
        if (query === 'ROLE:') {
          return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [RoleGroupMock, RoleGroupMock2]));
        } else {
          return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [InstitutionalRoleGroupMock]));
        }
      },
      findAllByHref(href: string): Observable<RemoteData<PaginatedList<Group>>> {
        return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [InstitutionalScopedRoleGroupMock, InstitutionalScopedRoleGroupMock2]));
      },
      getGroupRegistryRouterLink(): string {
        return '';
      },
      getGroupEditPageRouterLink(): string {
        return '';
      }
    };

    builderService = getMockFormBuilderService();
    translateService = getMockTranslateService();
    authService = new AuthServiceStub();
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: observableOf(true)
    });
    epersonRegistrationService = jasmine.createSpyObj('epersonRegistrationService', {
      registerEmail: createSuccessfulRemoteDataObject$(null)
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
      declarations: [EPeopleRegistryComponent, EPersonFormComponent],
      providers: [EPersonFormComponent,
        { provide: EPersonDataService, useValue: ePersonDataServiceStub },
        { provide: GroupDataService, useValue: groupDataServiceStub },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: FormBuilderService, useValue: builderService },
        { provide: DSOChangeAnalyzer, useValue: {} },
        { provide: HttpClient, useValue: {} },
        { provide: ObjectCacheService, useValue: {} },
        { provide: UUIDService, useValue: {} },
        { provide: Store, useValue: {} },
        { provide: RemoteDataBuildService, useValue: {} },
        { provide: HALEndpointService, useValue: {} },
        { provide: AuthService, useValue: authService },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: EpersonRegistrationService, useValue: epersonRegistrationService },
        EPeopleRegistryComponent,
        ChangeDetectorRef
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EPersonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create EPersonFormComponent', () => {
    expect(component).toBeDefined();
  });

  describe('when submitting the form', () => {
    let firstName;
    let lastName;
    let email;
    let canLogIn;
    let requireCertificate;

    let expected;
    beforeEach(() => {
      firstName = 'testName';
      lastName = 'testLastName';
      email = 'testEmail@test.com';
      canLogIn = false;
      requireCertificate = false;

      expected = Object.assign(new EPerson(), {
        metadata: {
          'eperson.firstname': [
            {
              value: firstName
            }
          ],
          'eperson.lastname': [
            {
              value: lastName
            },
          ],
          'perucris.eperson.role': [
            {
              value: RoleGroupMock2.name,
              authority: RoleGroupMock2.id,
              confidence: 600
            },
          ],
          'perucris.eperson.institutional-role': [
            {
              value: InstitutionalRoleGroupMock.name,
              authority: InstitutionalRoleGroupMock.id,
              confidence: 600
            },
          ],
          'perucris.eperson.institutional-scoped-role': [
            {
              value: InstitutionalScopedRoleGroupMock.name,
              authority: InstitutionalScopedRoleGroupMock.id,
              confidence: 600
            },
          ]
        },
        email: email,
        canLogIn: canLogIn,
        requireCertificate: requireCertificate,
      });
      spyOn(component.submitForm, 'emit');

      component.firstName.value = firstName;
      component.lastName.value = lastName;
      component.email.value = email;
      component.canLogIn.value = canLogIn;
      component.requireCertificate.value = requireCertificate;
      component.roles.group.forEach((model) => {
        if (model.name === RoleGroupMock2.id) {
          model.value = true;
        }
      });
      component.institutionalScopedRoles[0].group.forEach((model) => {
        if (model.name === InstitutionalScopedRoleGroupMock.id) {
          model.value = true;
        }
      });
    });

    describe('without active EPerson', () => {
      beforeEach(() => {
        spyOn(ePersonDataServiceStub, 'getActiveEPerson').and.returnValue(observableOf(undefined));
        component.onSubmit();
        fixture.detectChanges();
      });

      it('should emit a new eperson using the correct values', waitForAsync(() => {
        fixture.whenStable().then(() => {
          expect(component.submitForm.emit).toHaveBeenCalledWith(expected);
        });
      }));
    });

    describe('with an active eperson', () => {
      let expectedWithId;

      beforeEach(() => {
        expectedWithId = Object.assign(new EPerson(), {
          id: 'id',
          metadata: {
            'eperson.firstname': [
              {
                value: firstName
              }
            ],
            'eperson.lastname': [
              {
                value: lastName
              },
            ],
            'perucris.eperson.role': [
              {
                value: RoleGroupMock2.name,
                authority: RoleGroupMock2.id,
                confidence: 600
              },
            ],
            'perucris.eperson.institutional-role': [
              {
                value: InstitutionalRoleGroupMock.name,
                authority: InstitutionalRoleGroupMock.id,
                confidence: 600
              },
            ],
            'perucris.eperson.institutional-scoped-role': [
              {
                value: InstitutionalScopedRoleGroupMock.name,
                authority: InstitutionalScopedRoleGroupMock.id,
                confidence: 600
              },
            ]
          },
          email: email,
          canLogIn: canLogIn,
          requireCertificate: requireCertificate,
          _links: undefined
        });
        spyOn(ePersonDataServiceStub, 'getActiveEPerson').and.returnValue(observableOf(expectedWithId));
        component.onSubmit();
        fixture.detectChanges();
      });

      it('should emit the existing eperson using the correct values', waitForAsync(() => {
        fixture.whenStable().then(() => {
          expect(component.submitForm.emit).toHaveBeenCalledWith(expectedWithId);
        });
      }));
    });
  });

  describe('impersonate', () => {
    let ePersonId;

    beforeEach(() => {
      spyOn(authService, 'impersonate').and.callThrough();
      ePersonId = 'testEPersonId';
      component.epersonInitial = Object.assign(new EPerson(), {
        id: ePersonId
      });
      component.impersonate();
    });

    it('should call authService.impersonate', () => {
      expect(authService.impersonate).toHaveBeenCalledWith(ePersonId);
    });

    it('should set isImpersonated to true', () => {
      expect(component.isImpersonated).toBe(true);
    });
  });

  describe('stopImpersonating', () => {
    beforeEach(() => {
      spyOn(authService, 'stopImpersonatingAndRefresh').and.callThrough();
      component.stopImpersonating();
    });

    it('should call authService.stopImpersonatingAndRefresh', () => {
      expect(authService.stopImpersonatingAndRefresh).toHaveBeenCalled();
    });

    it('should set isImpersonated to false', () => {
      expect(component.isImpersonated).toBe(false);
    });
  });

  describe('delete', () => {

    let ePersonId;
    let eperson: EPerson;
    let modalService;

    beforeEach(() => {
      spyOn(authService, 'impersonate').and.callThrough();
      ePersonId = 'testEPersonId';
      eperson = EPersonMock;
      component.epersonInitial = eperson;
      component.canDelete$ = observableOf(true);
      spyOn(component.epersonService, 'getActiveEPerson').and.returnValue(observableOf(eperson));
      modalService = (component as any).modalService;
      spyOn(modalService, 'open').and.returnValue(Object.assign({ componentInstance: Object.assign({ response: observableOf(true) }) }));
      fixture.detectChanges();

    });

    it('the delete button should be active if the eperson can be deleted', () => {
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      expect(deleteButton.nativeElement.disabled).toBe(false);
    });

    it('the delete button should be disabled if the eperson cannot be deleted', () => {
      component.canDelete$ = observableOf(false);
      fixture.detectChanges();
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      expect(deleteButton.nativeElement.disabled).toBe(true);
    });

    it('should call the epersonFormComponent delete when clicked on the button', () => {
      spyOn(component, 'delete').and.stub();
      spyOn(component.epersonService, 'deleteEPerson').and.returnValue(createSuccessfulRemoteDataObject$('No Content', 204));
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      deleteButton.triggerEventHandler('click', null);
      expect(component.delete).toHaveBeenCalled();
    });

    it('should call the epersonService delete when clicked on the button', () => {
      // ePersonDataServiceStub.activeEPerson = eperson;
      spyOn(component.epersonService, 'deleteEPerson').and.returnValue(createSuccessfulRemoteDataObject$('No Content', 204));
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      expect(deleteButton.nativeElement.disabled).toBe(false);
      deleteButton.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.epersonService.deleteEPerson).toHaveBeenCalledWith(eperson);
    });
  });

  describe('Reset Password', () => {
    let ePersonId;
    let ePersonEmail;

    beforeEach(() => {
      ePersonId = 'testEPersonId';
      ePersonEmail = 'person.email@4science.it';
      component.epersonInitial = Object.assign(new EPerson(), {
        id: ePersonId,
        email: ePersonEmail
      });
      component.resetPassword();
    });

    it('should call epersonRegistrationService.registerEmail', () => {
      expect(epersonRegistrationService.registerEmail).toHaveBeenCalledWith(ePersonEmail);
    });
  });
});
