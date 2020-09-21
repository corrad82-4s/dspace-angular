import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { getCommunityPageRoute } from 'src/app/+community-page/community-page-routing.module';
import { InstitutionDataService } from 'src/app/core/institution/institution-data.service';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';

/**
 * A component to create a new institution starting from the configured institution template.
 */
@Component({
  selector: 'ds-institution-creation',
  templateUrl: './institution-creation.component.html'
})
export class InstitutionCreationComponent implements OnInit {

  form: FormGroup;

  subs: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private institutionService: InstitutionDataService,
    private notificationService: NotificationsService,
    private translateService: TranslateService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: new FormControl('', {
        validators: [Validators.required],
      })
    });
  }

  submit() {
    const institutionName = this.form.value.name;
    this.subs.push(this.institutionService.createInstitution(institutionName)
      .subscribe((remoteData) => {
        if (remoteData.hasSucceeded) {
          this.notificationService.success(this.translateService.instant('admin.institution.new.success'));
          this.router.navigateByUrl(getCommunityPageRoute(remoteData.payload.id));
        } else {
          this.notificationService.success(this.translateService.instant('admin.institution.new.error'));
        }
      }));
  }
}
