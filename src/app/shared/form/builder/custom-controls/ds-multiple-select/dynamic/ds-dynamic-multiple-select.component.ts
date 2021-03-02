import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  DynamicFormControlComponent,
  DynamicFormControlCustomEvent,
  DynamicFormLayout,
  DynamicFormLayoutService,
  DynamicFormValidationService,
} from '@ng-dynamic-forms/core';
import { DsMultipleSelectControlComponent } from '../ds-multiple-select-control.component';
import { DsDynamicMultipleSelectModel } from './ds-dynamic-multiple-select.model';

@Component({
  selector: 'ds-dynamic-multiple-select',
  templateUrl: './ds-dynamic-multiple-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DsDynamicMultipleSelectComponent extends DynamicFormControlComponent {

  @Input() group: FormGroup;
  @Input() formLayout: DynamicFormLayout;
  @Input() model: DsDynamicMultipleSelectModel<any>;

  @Output() blur: EventEmitter<any> = new EventEmitter();
  @Output() change: EventEmitter<any> = new EventEmitter();
  @Output() customEvent: EventEmitter<DynamicFormControlCustomEvent> = new EventEmitter();
  @Output() focus: EventEmitter<any> = new EventEmitter();

  @ViewChild(DsMultipleSelectControlComponent) myCustomFormControlComponent: DsMultipleSelectControlComponent;

  constructor(protected layoutService: DynamicFormLayoutService,
              protected validationService: DynamicFormValidationService) {

    super(layoutService, validationService);
  }
}
