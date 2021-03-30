import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs/operators';
import { DnisRestService } from './dnis-rest.service';

export enum DniValidationError {
  BAD_REQUEST = 'bad-request',
  DNI_ALREADY_PRESENT = 'dni-already-present',
  SERVICE_UNAVAILABLE = 'service-unavailable',
  DNI_NOT_FOUND = 'dni-not-found',
  NOT_MATCHING  = 'not-matching',
}

@Component({
  selector: 'ds-register-dni',
  templateUrl: './register-dni.component.html'
})
/**
 * Component responsible the email registration step when registering as a new user
 */
export class RegisterDniComponent implements OnInit {

  form: FormGroup;

  dniValidationError: DniValidationError = null;

  dniValidationSuccess = false;

  dniLoading = false;

  constructor(private notificationService: NotificationsService,
              private translateService: TranslateService,
              private ngbDateParserFormatter: NgbDateParserFormatter,
              private dnisRestService: DnisRestService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private formBuilder: FormBuilder) {
  }

  get dni() {
    return this.form.get('dni');
  }

  get dob() {
    return this.form.get('dob');
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      dni: new FormControl(null, [Validators.required]),
      dob: new FormControl(null, [Validators.required]),
    });
  }

  verifyDni() {
    this.dniLoading = true;
    this.dniValidationSuccess = false;
    this.dniValidationError = null;

    this.dnisRestService.verifyDni(this.dni.value, this.ngbDateParserFormatter.format(this.dob.value)).pipe(take(1)).subscribe(
      (restResponse) => {
        this.dniValidationError = this.parseValidationError(restResponse.statusCode);
        this.dniValidationSuccess = this.dniValidationError === null;
        this.dniLoading = false;
        this.cdr.markForCheck();
        if (this.dniValidationSuccess) {
          this.onValidationSuccess();
        }
      });
  }

  protected onValidationSuccess() {
    this.router.navigate(
      [this.dni.value, this.ngbDateParserFormatter.format(this.dob.value)],
      { relativeTo: this.activatedRoute });
  }

  protected parseValidationError(statusCode): DniValidationError {
    let dniValidationError = null;
    switch (statusCode) {
      case 400:
        dniValidationError = DniValidationError.BAD_REQUEST;
        break;
      case 404:
        dniValidationError = DniValidationError.DNI_NOT_FOUND;
        break;
      case 409:
        dniValidationError = DniValidationError.DNI_ALREADY_PRESENT;
        break;
      case 422:
        dniValidationError = DniValidationError.NOT_MATCHING;
        break;
      case 503:
        dniValidationError = DniValidationError.SERVICE_UNAVAILABLE;
        break;
    }
    return dniValidationError;
  }


}
