import { FormFieldModel } from '../models/form-field.model';

import { ConcatFieldParser } from './concat-field-parser';

export class SeriesFieldParser extends ConcatFieldParser {

  constructor(protected configData: FormFieldModel, protected initFormValues) {
    super(configData, initFormValues, ';');
  }
}