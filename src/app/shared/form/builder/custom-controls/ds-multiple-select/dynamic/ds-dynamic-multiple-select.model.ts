import { DynamicFormControlLayout } from '@ng-dynamic-forms/core/lib/model/misc/dynamic-form-control-layout.model';
import { DynamicSelectModel, serializable } from '@ng-dynamic-forms/core';
import { DynamicSelectModelConfig } from '@ng-dynamic-forms/core/lib/model/select/dynamic-select.model';

export const DS_DYNAMIC_MULTIPLE_SELECT = 'DS_DYNAMIC_MULTIPLE_SELECT';

export class DsDynamicMultipleSelectModel<T> extends DynamicSelectModel<T> {

  @serializable() readonly type: string = DS_DYNAMIC_MULTIPLE_SELECT;

  public constructor(config: DynamicSelectModelConfig<T>, layout?: DynamicFormControlLayout) {
    super(config, layout);
    this.multiple = true;
  }
}

