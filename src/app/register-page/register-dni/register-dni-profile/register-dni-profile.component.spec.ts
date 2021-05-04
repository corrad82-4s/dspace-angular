import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RegisterDniProfileComponent } from './register-dni-profile.component';
import { EPersonDataService } from '../../../core/eperson/eperson-data.service';
import { EndUserAgreementService } from '../../../core/end-user-agreement/end-user-agreement.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { of } from 'rxjs/internal/observable/of';

describe('RegisterDniProfileComponent', () => {
  let comp: RegisterDniProfileComponent;
  let fixture: ComponentFixture<RegisterDniProfileComponent>;

  let route;

  beforeEach(waitForAsync(() => {
    route = {
      params: of({ dni: '123456', date: '1982-11-09'})
    };
    TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule.withRoutes([]), TranslateModule.forRoot(), ReactiveFormsModule],
      declarations: [RegisterDniProfileComponent],
      providers: [
        {provide: Router, useValue: {}},
        {provide: ActivatedRoute, useValue: route},
        {provide: Store, useValue: {}},
        {provide: EPersonDataService, useValue: {}},
        {provide: FormBuilder, useValue: new FormBuilder()},
        {provide: NotificationsService, useValue: {}},
        {provide: EndUserAgreementService, useValue: {}},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterDniProfileComponent);
    comp = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('init', () => {
    it('should initialize dni and date', () => {
      expect(comp.dni).toEqual('123456');
      expect(comp.date).toEqual('1982-11-09');
    });
  });

  describe('canSubmit', () => {
    it('should allow submit when password and email are valid', () => {
      comp.isInValidPassword = false;
      comp.emailForm.patchValue({email: 'user@gmail.com'});

      const canSubmit = comp.canSubmit();

      expect(canSubmit).toEqual(true);
    });

    it('should prevent submit when password is invalid', () => {
      comp.isInValidPassword = true;

      const canSubmit = comp.canSubmit();

      expect(canSubmit).toEqual(false);
    });

    it('should prevent submit when email is invalid', () => {

      const canSubmit = comp.canSubmit();

      expect(canSubmit).toEqual(false);
    });
  });

  describe('getMetadataValues', () => {
    it('should return an empty object', () => {

      const metadata = comp.getMetadataValues();

      expect(metadata).toEqual({});
    });
  });

});
