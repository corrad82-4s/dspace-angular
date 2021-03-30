import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DniValidationError, RegisterDniComponent } from './register-dni.component';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { DnisRestService } from './dnis-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of as observableOf } from 'rxjs';
import { RouterStub } from '../../shared/testing/router.stub';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs/internal/observable/of';

describe('RegisterDniComponent', () => {

  let comp: RegisterDniComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<RegisterDniComponent>;
  let notificationsService;
  let dnisRestService;
  let router;
  let route;

  beforeEach(waitForAsync(() => {

    notificationsService = new NotificationsServiceStub();
    dnisRestService = new DnisRestService(null, null, null);
    route = {data: observableOf({})};
    router = new RouterStub();

    TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule.forRoot(), ReactiveFormsModule, NgbModule],
      declarations: [RegisterDniComponent],
      providers: [
        {provide: Router, useValue: router},
        {provide: ActivatedRoute, useValue: route},
        {provide: NotificationsService, useValue: notificationsService},
        {provide: FormBuilder, useValue: new FormBuilder()},
        {provide: DnisRestService, useValue: dnisRestService},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterDniComponent);
    comp = fixture.componentInstance;
    compAsAny = comp;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(comp).toBeDefined();
  });

  describe('parseValidationError', () => {
    it('should parse the response status code', () => {
      expect(compAsAny.parseValidationError(400)).toEqual(DniValidationError.BAD_REQUEST);
      expect(compAsAny.parseValidationError(404)).toEqual(DniValidationError.DNI_NOT_FOUND);
      expect(compAsAny.parseValidationError(409)).toEqual(DniValidationError.DNI_ALREADY_PRESENT);
      expect(compAsAny.parseValidationError(422)).toEqual(DniValidationError.NOT_MATCHING);
      expect(compAsAny.parseValidationError(503)).toEqual(DniValidationError.SERVICE_UNAVAILABLE);
      expect(compAsAny.parseValidationError(204)).toEqual(null);
    });
  });

  describe('verifyDni', () => {

    beforeEach(() => {
      comp.form.patchValue({ dni: '1234567', dob: { year: 1982, month: 11, day: 9 } });
      spyOn(dnisRestService, 'verifyDni').and.returnValue(of({ statusCode: 204}));
    });

    it('should call the dnisRestService.verifyDni with the form value', () => {

      comp.verifyDni();

      expect(dnisRestService.verifyDni).toHaveBeenCalledWith('1234567', '1982-11-09');
    });

    it('should call the onValidationSuccess on success', () => {

      spyOn(compAsAny, 'onValidationSuccess').and.callThrough();

      comp.verifyDni();

      expect(compAsAny.onValidationSuccess).toHaveBeenCalled();
    });
  });

  describe('onValidationSuccess', () => {
    it('should route to dni and date relative to the activated route', () => {

      comp.form.patchValue({ dni: '1234567', dob: { year: 1982, month: 11, day: 9 } });

      compAsAny.onValidationSuccess();

      expect(router.navigate).toHaveBeenCalledWith(['1234567', '1982-11-09'], { relativeTo: route});
    });
  });
});
