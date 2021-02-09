import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../shared/mocks/translate-loader.mock';
import { getMockTranslateService } from '../../../shared/mocks/translate.service.mock';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import {
  createFailedRemoteDataObject$,
  createSuccessfulRemoteDataObject$
} from '../../../shared/remote-data.utils';
import { NotificationsServiceStub } from '../../../shared/testing/notifications-service.stub';
import { InstitutionCreationComponent } from './institution-creation.component';
import { RouterMock } from '../../../shared/mocks/router.mock';
import { Community } from '../../../core/shared/community.model';
import { InstitutionDataService } from '../../../core/institution/institution-data.service';

describe('InstitutionCreationComponent', () => {

  let component: InstitutionCreationComponent;
  let fixture: ComponentFixture<InstitutionCreationComponent>;
  let translateService: TranslateService;
  let institutionService: InstitutionDataService;
  let notificationsService: NotificationsServiceStub;
  let router: RouterMock;

  beforeEach(() => {

    notificationsService = new NotificationsServiceStub();
    translateService = getMockTranslateService();
    router = new RouterMock();
    institutionService = jasmine.createSpyObj('institutionService', {
      createInstitution: createSuccessfulRemoteDataObject$(new Community())
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
      declarations: [InstitutionCreationComponent],
      providers: [
        { provide: NotificationsService, useValue: notificationsService },
        { provide: InstitutionDataService, useValue: institutionService },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstitutionCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create InstitutionCreationComponent', () => {
    expect(component).toBeDefined();
  });

  describe('when submitting the form', () => {

    it('should call the service to create the institution using the correct name', fakeAsync(() => {
      component.form.value.name = 'Institution Name';
      component.submit();
      tick();
      fixture.detectChanges();
      expect(institutionService.createInstitution).toHaveBeenCalledWith('Institution Name');
      expect(notificationsService.success).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/institutions/explore');
    }));

    it('should show an error notification if some errors occurs', fakeAsync(() => {
      jasmine.getEnv().allowRespy(true);
      spyOn(institutionService, 'createInstitution').and.returnValue(createFailedRemoteDataObject$());
      component.form.value.name = 'Institution Name';
      component.submit();
      tick();
      fixture.detectChanges();
      expect(institutionService.createInstitution).toHaveBeenCalledWith('Institution Name');
      expect(notificationsService.error).toHaveBeenCalled();
    }));
  });

});
