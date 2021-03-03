import {
  DynamicFormLayoutService,
  DynamicFormsCoreModule,
  DynamicFormValidationService
} from '@ng-dynamic-forms/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { DsMultipleSelectControlComponent } from './ds-multiple-select-control.component';
import { getMockFormBuilderService } from '../../../../mocks/form-builder-service.mock';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../../mocks/translate-loader.mock';
import { FormBuilderService } from '../../form-builder.service';
import { DynamicFormsNGBootstrapUIModule } from '@ng-dynamic-forms/ui-ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';

describe('DsMultipleSelectControlComponent', () => {

  let fixture: ComponentFixture<DsMultipleSelectControlComponent>;
  let component: DsMultipleSelectControlComponent;
  let debugElement: DebugElement;
  let builderService: FormBuilderService;

  beforeEach(waitForAsync(() => {

    builderService = getMockFormBuilderService();

    TestBed.configureTestingModule({
      imports: [
        DynamicFormsCoreModule,
        DynamicFormsNGBootstrapUIModule,
        FormsModule,
        NgbModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateLoaderMock }
        }),
      ],
      declarations: [DsMultipleSelectControlComponent],
      providers: [
        { provide: DynamicFormLayoutService },
        { provide: DynamicFormValidationService },
        { provide: FormBuilderService },
      ]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(DsMultipleSelectControlComponent);

      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
    });
  }));

  beforeEach(() => {

    component.id = 'multiple-control';
    component.options = [{ value: 'value1' , label: 'label1'}, { value: 'value2' , label: 'label2'}] as any;

    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the inner select with the provided options', () => {

    const options = debugElement.queryAll(By.css('option'));
    expect(options.length).toEqual(3);
    // hint disabled options
    expect(options[0].nativeElement.innerText).toEqual('Select an option');
    expect(options[0].nativeElement.disabled).toBeTrue();
    // options labels
    expect(options[1].nativeElement.innerText).toEqual('label1');
    expect(options[2].nativeElement.innerText).toEqual('label2');
    // options values
    expect(options[1].nativeElement.value).toContain('value1');
    expect(options[2].nativeElement.value).toContain('value2');
    // selected indexes
    expect(component.indexes).toEqual([]);

  });

  describe('when a value is passed', () => {

    it('should initialize the selected indexes correctly', () => {

      component.writeValue(['value1']); // index 0

      expect(component.indexes).toEqual([0]);

    });
  });

  describe('when there are selected indexes', () => {

    it('should visualize corresponding chips', () => {

      component.indexes = [1]; // option { label: 'label2' }

      fixture.detectChanges();

      const chips = debugElement.queryAll(By.css('.badge'));
      expect(chips.length).toBe(1);
      expect(chips[0].nativeElement.innerText).toBe('label2');

    });
  });

  describe('when user clicks on a selected chip', () => {

    it('should remove the corresponding index', () => {

      component.indexes = [1];
      fixture.detectChanges();

      const chip = debugElement.query(By.css('.badge'));
      chip.triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.indexes).toEqual([]);

    });

    it('should call the registeredOnChange with the new array value', () => {

      component.indexes = [1];
      fixture.detectChanges();
      spyOn(component, '_onChange').and.callThrough();

      const chip = debugElement.query(By.css('.badge'));
      chip.triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component._onChange).toHaveBeenCalledWith([]);
    });

  });

  describe('when user select an option', () => {

    it('should add the corresponding index', () => {

      component.innerSelectModel.select(1); // means index 0 (for the first disabled option)
      fixture.detectChanges();

      expect(component.indexes).toEqual([0]);

    });

    it('should call the registeredOnChange with the new array value', () => {

      spyOn(component, '_onChange').and.callThrough();

      component.innerSelectModel.select(1); // means index 0 (for the first disabled option)
      fixture.detectChanges();

      expect(component._onChange).toHaveBeenCalledWith(['value1']);

    });

  });

});
