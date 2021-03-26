import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EndUserAgreementService } from '../../../core/end-user-agreement/end-user-agreement.service';
import { EPersonDataService } from '../../../core/eperson/eperson-data.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { CoreState } from '../../../core/core.reducers';
import { CreateProfileComponent } from '../../create-profile/create-profile.component';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { RemoteData } from '../../../core/data/remote-data';
import { EPerson } from '../../../core/eperson/models/eperson.model';
import { AuthenticateAction } from '../../../core/auth/auth.actions';

@Component({
  selector: 'ds-register-dni-profile',
  templateUrl: './register-dni-profile.component.html'
})
export class RegisterDniProfileComponent extends CreateProfileComponent {

  dni: string;
  date: string;

  constructor(protected translateService: TranslateService,
              protected ePersonDataService: EPersonDataService,
              protected store: Store<CoreState>,
              protected router: Router,
              protected route: ActivatedRoute,
              protected formBuilder: FormBuilder,
              protected notificationsService: NotificationsService,
              protected endUserAgreementService: EndUserAgreementService) {
    super(translateService, ePersonDataService, store, router, route, formBuilder, notificationsService, endUserAgreementService);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.dni = params.dni;
      this.date = params.date;
    });
  }

  canSubmit() {
    return !this.isInValidPassword;
  }

  getMetadataValues(): any {
    return {};
  }

  createEPerson(eperson): Observable<RemoteData<EPerson>> {
    return this.ePersonDataService.createEPersonForDniAndDate(eperson, this.dni, this.date);
  }

  dispatchAuthenticateAction() {
    this.store.dispatch(new AuthenticateAction(this.dni, this.password));
  }

}
