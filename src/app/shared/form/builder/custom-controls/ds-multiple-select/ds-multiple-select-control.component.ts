import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DynamicFormControlModel, DynamicFormOption, DynamicSelectModel } from '@ng-dynamic-forms/core';
import { FormBuilderService } from '../../form-builder.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { hasValue, hasValueOperator } from '../../../../empty.util';
import { isEqual as _isEqual } from 'lodash';

function isFunction(value: any): boolean {
  return value && typeof value === 'function';
}


/**
 * Custom form control that allows to select multiple options.
 * The value of this control is an array of the selected options values.
 */
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

  /**
   * Id of the form control.
   */
  @Input() id;

  /**
   * The available presented options.
   */
  @Input() options: DynamicFormOption<any>[];

  // /**
  //  * The initial selected options values.
  //  */
  // @Input() value: any[];

  /**
   * Function used to compare options values (default _lodash isEqual)
   */
  @Input() compareWithFn;

  /**
   * Message displayed when there are no selected options.
   */
  @Input() noSelectionHint = 'form.multiple-selection.no-selection';

  @Output() blur: EventEmitter<any> = new EventEmitter();
  @Output() focus: EventEmitter<any> = new EventEmitter();

  innerSelectModel: DynamicSelectModel<any>;
  innerFormModel: DynamicFormControlModel[];
  innerFormGroup: FormGroup;
  indexes: number[] = [];

  constructor(private formBuilderService: FormBuilderService) {
  }

  _onChange = (_: any) => { /**/ };

  ngOnInit() {
    this.initComponent();
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void { /**/ }

  writeValue(value: any): void {
    this.indexes = hasValue(value) ? value.map(v => this.getIndex(v)) : [];
  }

  initComponent() {
    this.compareWithFn = isFunction(this.compareWithFn) ? this.compareWithFn : _isEqual;
    this.initializeInnerSelect();
  }

  initializeInnerSelect() {
    this.innerSelectModel = new DynamicSelectModel<string>({
      id: this.id + '-inner-multiple-select',
      options: [ {value: null, label: 'Select an option', disabled: true}, ...this.options]
    });
    this.innerFormModel = [this.innerSelectModel];
    this.innerFormGroup = this.formBuilderService.createFormGroup(this.innerFormModel);
    this.innerSelectModel.select(0);
    this.innerSelectModel.valueChanges.pipe(distinctUntilChanged(), hasValueOperator()).subscribe((changes) => {
       this.onInnerSelectValueChange(changes);
    });
  }

  onInnerSelectValueChange(changes) {

    const index = this.getIndex(changes);

    // already present
    if (this.indexes.includes(index)) {
      return;
    }

    // update inner state
    this.indexes.push(index);

    // notify
    const value = this.indexes.map(i => this.options[i].value);
    this._onChange(value);
  }

  removeSelected(index: number) {
    this.indexes = this.indexes.filter(i => i !== index);
    const value = this.indexes.map(i => this.options[i].value);
    this._onChange(value);
    this.innerSelectModel.select(0);
  }


  getLabel(index) {
    const option = this.options[index];
    return option?.label;
  }

  /**
   * Retrieve the option's index for the given value. It applies the compareWithFn function.
   * @param value
   * @private
   */
  private getIndex(value) {
    let index = null;
    this.options.forEach((opt, i) => {
      if (index !== null) {
        return;
      }
      if (this.compareWithFn(value, opt.value)) {
        index = i;
      }
    });
    return index;
  }


}
