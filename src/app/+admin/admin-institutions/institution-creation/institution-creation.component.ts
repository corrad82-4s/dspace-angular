import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { getCommunityPageRoute } from 'src/app/+community-page/community-page-routing-paths';
import { InstitutionDataService } from 'src/app/core/institution/institution-data.service';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { getInstitutionExploreRoute } from '../admin-institutions-routing.module';

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

 /**
  * A boolean representing if a create delete operation is pending
  * @type {BehaviorSubject<boolean>}
  */
 processingCreate$: BehaviorSubject<boolean>  = new BehaviorSubject<boolean>(false);

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
    this.processingCreate$.next(true);
    const institutionName = this.form.value.name;
    this.subs.push(this.institutionService.createInstitution(institutionName)
      .subscribe((remoteData) => {
        this.processingCreate$.next(false);
        if (remoteData.hasSucceeded) {
          this.notificationService.success(this.translateService.instant('admin.institution.new.success'));
          this.router.navigateByUrl(getInstitutionExploreRoute());
        } else {
          this.notificationService.error(this.translateService.instant('admin.institution.new.error'));
        }
      }));
  }

  /**
   * Return a boolean representing if a create operation is pending.
   *
   * @return {Observable<boolean>}
   */
  isProcessingCreate(): Observable<boolean> {
    return this.processingCreate$.asObservable();
  }
}
