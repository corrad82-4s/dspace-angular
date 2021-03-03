import {
  DYNAMIC_FORM_CONTROL_MAP_FN, DynamicFormControl,
  DynamicFormControlModel,
  DynamicFormsCoreModule,
  DynamicFormService
} from '@ng-dynamic-forms/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TextMaskModule } from 'angular2-text-mask';
import { By } from '@angular/platform-browser';
import { DS_DYNAMIC_MULTIPLE_SELECT, DsDynamicMultipleSelectModel } from './ds-dynamic-multiple-select.model';
import { DsDynamicMultipleSelectComponent } from './ds-dynamic-multiple-select.component';
import { DsMultipleSelectControlComponent } from '../ds-multiple-select-control.component';
import { FormBuilderService } from '../../../form-builder.service';
import { getMockFormBuilderService } from '../../../../../mocks/form-builder-service.mock';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../../../mocks/translate-loader.mock';

describe('DsDynamicMultipleSelectComponent', () => {

  const testModel = new DsDynamicMultipleSelectModel({
    id: 'multiple-select',
    options: [{ value: 'value1' , label: 'label1'}, { value: 'value2' , label: 'label2'}],
    value: []
  });
  const formModel = [testModel];
  let formGroup: FormGroup;
  let fixture: ComponentFixture<DsDynamicMultipleSelectComponent>;
  let component: DsDynamicMultipleSelectComponent;
  let debugElement: DebugElement;
  let builderService: FormBuilderService;

  beforeEach(waitForAsync(() => {

    builderService = getMockFormBuilderService();

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        TextMaskModule,
        DynamicFormsCoreModule.forRoot(),
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateLoaderMock }
        }),
      ],
      declarations: [DsDynamicMultipleSelectComponent, DsMultipleSelectControlComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: DYNAMIC_FORM_CONTROL_MAP_FN,
          useValue: (model: DynamicFormControlModel): Type<DynamicFormControl> | null => {
            switch (model.type) {
              case DS_DYNAMIC_MULTIPLE_SELECT:
                return DsDynamicMultipleSelectComponent;

            }
          }
        },
        {  provide: FormBuilderService, useValue: builderService }
      ]

    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(DsDynamicMultipleSelectComponent);

      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
    });
  }));

  beforeEach(inject([DynamicFormService], (service: DynamicFormService) => {
    formGroup = service.createFormGroup(formModel);

    component.group = formGroup;
    component.model = testModel;

    fixture.detectChanges();

  }));

  it('should initialize correctly', () => {
    expect(component).toBeTruthy();
  });

  it('should instantiate a multiple-select control correctly', () => {
    const control = debugElement.query(By.directive(DsMultipleSelectControlComponent));
    expect(control).toBeTruthy();
    expect(control.componentInstance.id).toEqual('multiple-select');
    expect(control.componentInstance.options).toEqual(testModel.options);
  });

});
