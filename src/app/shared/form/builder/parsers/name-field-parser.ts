import { FormFieldModel } from '../models/form-field.model';

import { ConcatFieldParser } from './concat-field-parser';

export class NameFieldParser extends ConcatFieldParser {

  constructor(protected configData: FormFieldModel, protected initFormValues) {
    super(configData, initFormValues, ',', 'submission.section.form.last_name', 'submission.section.form.first_name');
  }
}