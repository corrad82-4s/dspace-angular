import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DsDynamicMultipleSelectModel } from './dynamic/ds-dynamic-multiple-select.model';
import { DynamicFormControlModel, DynamicSelectModel } from '@ng-dynamic-forms/core';
import { FormBuilderService } from '../../form-builder.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { hasValueOperator } from '../../../../empty.util';

@Component({
  selector: 'ds-multiple-select-control',
  templateUrl: './ds-multiple-select-control.component.html',
  styleUrls: ['./ds-multiple-select-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // Usage of forwardRef necessary https://github.com/angular/angular.io/issues/1151
      // tslint:disable-next-line:no-forward-ref
      useExisting: forwardRef(() => DsMultipleSelectControlComponent),
      multi: true
    }
  ]
})
export class DsMultipleSelectControlComponent implements OnInit, ControlValueAccessor {

  @Input() id;
  @Input() name;
  @Input() model: DsDynamicMultipleSelectModel<any>;

  @Output() blur: EventEmitter<any> = new EventEmitter();
  @Output() focus: EventEmitter<any> = new EventEmitter();

  innerSelectModel: DynamicSelectModel<any>;
  innerFormModel: DynamicFormControlModel[];
  innerFormGroup: FormGroup;
  indexes: number[] = [];

  noSelectionHint = 'form.multiple-selection.no-selection';

  constructor(private formBuilderService: FormBuilderService) {
  }

  ngOnInit() {
    this.initComponent();
  }

  registerOnChange(fn: any): void { /**/ }

  registerOnTouched(fn: any): void { /**/ }

  writeValue(obj: any): void { /**/ }

  initComponent() {
    this.initializeInnerSelection();
    this.initializeInnerSelect();
    if (this.model?.additional?.noSelectionHint) {
      this.noSelectionHint = this.model.additional.noSelectionHint;
    }
  }

  initializeInnerSelection() {
    this.indexes = this.model.value.map(value => this.getIndex(value));
  }

  initializeInnerSelect() {
    this.innerSelectModel = new DynamicSelectModel<string>({
      id: this.id + 'inner-multiple-select',
      options: [ {value: null, label: 'Select an option', disabled: true}, ...this.model.options]
    });
    this.innerSelectModel.select(0);
    this.innerFormModel = [this.innerSelectModel];
    this.innerFormGroup = this.formBuilderService.createFormGroup(this.innerFormModel);
    this.innerSelectModel.valueChanges.pipe(distinctUntilChanged(), hasValueOperator()).subscribe((changes) => {
       this.onSelectValueChange(changes);
    });
  }

  onSelectValueChange(changes) {

    const index = this.getIndex(changes);

    // already present
    if (this.indexes.includes(index)) {
      return;
    }

    // update inner state
    this.indexes.push(index);

    // notify
    this.model.select(...this.indexes);
  }

  removeSelected(index: number) {
    this.indexes = this.indexes.filter(i => i !== index);
    this.model.select(...this.indexes);
    this.innerSelectModel.select(0);
  }


  getLabel(index) {
    const option = this.model.get(index);
    return option?.label;
  }

  /**
   *
   * @param value
   * @private
   */
  private getIndex(value) {
    let index = null;
    this.model.options.forEach((opt, i) => {
      if (index !== null) {
        return;
      }
      if (this.model.compareWithFn(value, opt.value)) {
        index = i;
      }
    });
    return index;
  }


}
