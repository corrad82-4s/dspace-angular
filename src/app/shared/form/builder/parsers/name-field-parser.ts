import { FormFieldModel } from '../models/form-field.model';

import { ConcatFieldParser } from './concat-field-parser';

export class NameFieldParser extends ConcatFieldParser {

  constructor(protected configData: FormFieldModel, protected initFormValues, protected readOnly: boolean) {
    super(configData, initFormValues, readOnly, ',', 'submission.sections.form.last_name', 'submission.sections.form.first_name');
  }
}