import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  DynamicCheckboxGroupModel,
  DynamicCheckboxModel,
  DynamicFormControlModel,
  DynamicFormLayout,
  DynamicInputModel
} from '@ng-dynamic-forms/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, of, Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { flatMap, map, reduce, switchMap, take, tap } from 'rxjs/operators';
import { PaginatedList } from '../../../../core/data/paginated-list.model';
import { RemoteData } from '../../../../core/data/remote-data';
import { EPersonDataService } from '../../../../core/eperson/eperson-data.service';
import { GroupDataService } from '../../../../core/eperson/group-data.service';
import { EPerson } from '../../../../core/eperson/models/eperson.model';
import { Group } from '../../../../core/eperson/models/group.model';
import {
  getFirstSucceededRemoteData,
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload,
  getFirstSucceededRemoteListPayload,
  getPaginatedListPayload,
  getRemoteDataPayload
} from '../../../../core/shared/operators';
import { hasValue } from '../../../../shared/empty.util';
import { FormBuilderService } from '../../../../shared/form/builder/form-builder.service';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { PaginationComponentOptions } from '../../../../shared/pagination/pagination-component-options.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { NoContent } from '../../../../core/shared/NoContent.model';
import { Registration } from '../../../../core/shared/registration.model';
import { EpersonRegistrationService } from 'src/app/core/data/eperson-registration.service';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RequestService } from 'src/app/core/data/request.service';

@Component({
  selector: 'ds-eperson-form',
  templateUrl: './eperson-form.component.html'
})
/**
 * A form used for creating and editing EPeople
 */
export class EPersonFormComponent implements OnInit, OnDestroy {

  labelPrefix = 'admin.access-control.epeople.form.';

  /**
   * A unique id used for ds-form
   */
  formId = 'eperson-form';

  /**
   * The labelPrefix for all messages related to this form
   */
  messagePrefix = 'admin.access-control.epeople.form';

  /**
   * Dynamic input models for the inputs of form
   */
  firstName: DynamicInputModel;
  lastName: DynamicInputModel;
  email: DynamicInputModel;
  /**
   * Dynamic checkbox group model for the eperson roles.
   */
  roles: DynamicCheckboxGroupModel;
  institutionalScopedRoles: DynamicCheckboxGroupModel[];
  // booleans
  canLogIn: DynamicCheckboxModel;
  requireCertificate: DynamicCheckboxModel;

  /**
   * A list of all dynamic input models
   */
  formModel: DynamicFormControlModel[];

  /**
   * Layout used for structuring the form inputs
   */
  formLayout: DynamicFormLayout = {
    firstName: {
      grid: {
        host: 'row'
      }
    },
    lastName: {
      grid: {
        host: 'row'
      }
    },
    email: {
      grid: {
        host: 'row'
      }
    },
    roles: {
      grid: {
        host: 'row'
      }
    },
    canLogIn: {
      grid: {
        host: 'col col-sm-6 d-inline-block'
      }
    },
    requireCertificate: {
      grid: {
        host: 'col col-sm-6 d-inline-block'
      }
    },
  };

  /**
   * A FormGroup that combines all inputs
   */
  formGroup: FormGroup;

  /**
   * An EventEmitter that's fired whenever the form is being submitted
   */
  @Output() submitForm: EventEmitter<any> = new EventEmitter();

  /**
   * An EventEmitter that's fired whenever the form is cancelled
   */
  @Output() cancelForm: EventEmitter<any> = new EventEmitter();

  /**
   * Observable whether or not the admin is allowed to delete the EPerson
   */
  canDelete$: Observable<boolean>;

  /**
   * Observable whether or not the admin is allowed to impersonate the EPerson
   */
  canImpersonate$: Observable<boolean>;

  /**
   * List of subscriptions
   */
  subs: Subscription[] = [];

  /**
   * A list of all the groups this EPerson is a member of
   */
  groups: Observable<RemoteData<PaginatedList<Group>>>;

  /**
   * Pagination config used to display the list of groups
   */
  config: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'groups-ePersonMemberOf-list-pagination',
    pageSize: 5,
    currentPage: 1
  });

  /**
   * Try to retrieve initial active eperson, to fill in checkboxes at component creation
   */
  epersonInitial: EPerson;

  /**
   * Whether or not this EPerson is currently being impersonated
   */
  isImpersonated = false;

  /**
   * A map between the id of Institutional scoped roles and the related Institutional roles.
   */
  institutionalRoleMap = new Map<string,Group>();

  constructor(public epersonService: EPersonDataService,
              public groupsDataService: GroupDataService,
              private formBuilderService: FormBuilderService,
              private translateService: TranslateService,
              private notificationsService: NotificationsService,
              private authService: AuthService,
              private authorizationService: AuthorizationDataService,
              private modalService: NgbModal,
              public requestService: RequestService,
              private epersonRegistrationService: EpersonRegistrationService,
              private changeDetectorRef: ChangeDetectorRef) {
    this.subs.push(this.epersonService.getActiveEPerson().subscribe((eperson: EPerson) => {
      this.epersonInitial = eperson;
      if (hasValue(eperson)) {
        this.isImpersonated = this.authService.isImpersonatingUser(eperson.id);
      }
    }));
  }

  ngOnInit() {
    this.initialisePage();
  }

  /**
   * This method will initialise the page
   */
  initialisePage() {
    combineLatest(
      this.translateService.get(`${this.messagePrefix}.firstName`),
      this.translateService.get(`${this.messagePrefix}.lastName`),
      this.translateService.get(`${this.messagePrefix}.email`),
      this.translateService.get(`${this.messagePrefix}.roles`),
      this.translateService.get(`${this.messagePrefix}.rolesNoAvailable`),
      this.translateService.get(`${this.messagePrefix}.canLogIn`),
      this.translateService.get(`${this.messagePrefix}.requireCertificate`),
      this.translateService.get(`${this.messagePrefix}.emailHint`),
      this.groupsDataService.searchGroups('ROLE:').pipe(getFirstSucceededRemoteListPayload()),
      this.groupsDataService.searchGroups('INSTITUTIONAL:').pipe(
        getFirstSucceededRemoteListPayload(),
        flatMap((institutionalRoleGroups) => institutionalRoleGroups),
        flatMap( (institutionalRoleGroup) => this.findInstitutionalScopedRoles(institutionalRoleGroup)),
        reduce((acc: any, value: any) => [...acc, ...value], [])
      ),
      this.epersonService.getActiveEPerson()
    ).subscribe(([firstName, lastName, email, roles, rolesNoAvailable, canLogIn, requireCertificate,
                  emailHint, roleGroups, institutionalRoles, eperson]) => {

      this.firstName = new DynamicInputModel({
        id: 'firstName',
        label: firstName,
        name: 'firstName',
        validators: {
          required: null,
        },
        required: true,
      });
      this.lastName = new DynamicInputModel({
        id: 'lastName',
        label: lastName,
        name: 'lastName',
        validators: {
          required: null,
        },
        required: true,
      });
      this.email = new DynamicInputModel({
        id: 'email',
        label: email,
        name: 'email',
        validators: {
          required: null,
          pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
        },
        required: true,
        hint: emailHint
      });
      this.roles = new DynamicCheckboxGroupModel({
        id: 'roles',
        label: roles,
        name: 'roles',
        group: this.initDynamicCheckboxModels(roleGroups, rolesNoAvailable)
      });
      this.canLogIn = new DynamicCheckboxModel(
          {
            id: 'canLogIn',
            label: canLogIn,
            name: 'canLogIn',
            value: (this.epersonInitial != null ? this.epersonInitial.canLogIn : true)
          });
      this.requireCertificate = new DynamicCheckboxModel(
          {
            id: 'requireCertificate',
            label: requireCertificate,
            name: 'requireCertificate',
            value: (this.epersonInitial != null ? this.epersonInitial.requireCertificate : false)
          });
      this.formModel = [
        this.firstName,
        this.lastName,
        this.email,
        this.canLogIn,
        this.requireCertificate,
      ];
      this.formGroup = this.formBuilderService.createFormGroup(this.formModel);
      this.subs.push(this.epersonService.getActiveEPerson().subscribe((eperson: EPerson) => {
        if (eperson != null) {
          this.groups = this.groupsDataService.findAllByHref(eperson._links.groups.href, {
            currentPage: 1,
            elementsPerPage: this.config.pageSize
          });
        }
        this.formGroup.patchValue({
          firstName: eperson != null ? eperson.firstMetadataValue('eperson.firstname') : '',
          lastName: eperson != null ? eperson.firstMetadataValue('eperson.lastname') : '',
          email: eperson != null ? eperson.email : '',
          canLogIn: eperson != null ? eperson.canLogIn : true,
          requireCertificate: eperson != null ? eperson.requireCertificate : false
        });
      }));
      this.canImpersonate$ = this.epersonService.getActiveEPerson().pipe(
          switchMap((eperson) => this.authorizationService.isAuthorized(FeatureID.LoginOnBehalfOf, hasValue(eperson) ? eperson.self : undefined))
      );
      this.canDelete$ = this.epersonService.getActiveEPerson().pipe(
          switchMap((eperson) => this.authorizationService.isAuthorized(FeatureID.CanDelete, hasValue(eperson) ? eperson.self : undefined))
      );
    });
  }

  /**
   * Stop editing the currently selected eperson
   */
  onCancel() {
    this.epersonService.cancelEditEPerson();
    this.cancelForm.emit();
  }

  /**
   * Submit the form
   * When the eperson has an id attached -> Edit the eperson
   * When the eperson has no id attached -> Create new eperson
   * Emit the updated/created eperson using the EventEmitter submitForm
   */
  onSubmit() {
    this.epersonService.getActiveEPerson().pipe(take(1)).subscribe(
      (ePerson: EPerson) => {
        const values = {
          metadata: {
            'eperson.firstname': [
              {
                value: this.firstName.value
              }
            ],
            'eperson.lastname': [
              {
                value: this.lastName.value
              },
            ],
            'perucris.eperson.role' : this.getSelectedRoles(),
            'perucris.eperson.institutional-role' : this.getSelectedInstitutionalRoles(),
            'perucris.eperson.institutional-scoped-role' : this.getSelectedInstitutionalScopedRoles()
          },
          email: this.email.value,
          canLogIn: this.canLogIn.value,
          requireCertificate: this.requireCertificate.value,
        };
        if (ePerson == null) {
          this.createNewEPerson(values);
        } else {
          this.editEPerson(ePerson, values);
        }
      }
    );
  }

  /**
   * Creates new EPerson based on given values from form
   * @param values
   */
  createNewEPerson(values) {
    const ePersonToCreate = Object.assign(new EPerson(), values);

    const response = this.epersonService.create(ePersonToCreate);
    response.pipe(
      getFirstCompletedRemoteData()
    ).subscribe((rd: RemoteData<EPerson>) => {
      if (rd.hasSucceeded) {
        this.notificationsService.success(this.translateService.get(this.labelPrefix + 'notification.created.success', { name: ePersonToCreate.name }));
        this.submitForm.emit(ePersonToCreate);
      } else {
        this.notificationsService.error(this.translateService.get(this.labelPrefix + 'notification.created.failure', { name: ePersonToCreate.name }));
        this.cancelForm.emit();
      }
    });
    this.showNotificationIfEmailInUse(ePersonToCreate, 'created');
  }

  /**
   * Edits existing EPerson based on given values from form and old EPerson
   * @param ePerson   ePerson to edit
   * @param values    new ePerson values (of form)
   */
  editEPerson(ePerson: EPerson, values) {
    const editedEperson = Object.assign(new EPerson(), {
      id: ePerson.id,
      metadata: {
        'eperson.firstname': [
          {
            value: (this.firstName.value ? this.firstName.value : ePerson.firstMetadataValue('eperson.firstname'))
          }
        ],
        'eperson.lastname': [
          {
            value: (this.lastName.value ? this.lastName.value : ePerson.firstMetadataValue('eperson.lastname'))
          },
        ],
        'perucris.eperson.role' : this.getSelectedRoles(),
        'perucris.eperson.institutional-role' : this.getSelectedInstitutionalRoles(),
        'perucris.eperson.institutional-scoped-role' : this.getSelectedInstitutionalScopedRoles()
      },
      email: (hasValue(values.email) ? values.email : ePerson.email),
      canLogIn: (hasValue(values.canLogIn) ? values.canLogIn : ePerson.canLogIn),
      requireCertificate: (hasValue(values.requireCertificate) ? values.requireCertificate : ePerson.requireCertificate),
      _links: ePerson._links,
    });

    const response = this.epersonService.updateEPerson(editedEperson);
    response.pipe(take(1)).subscribe((rd: RemoteData<EPerson>) => {
      if (rd.hasSucceeded) {
        this.notificationsService.success(this.translateService.get(this.labelPrefix + 'notification.edited.success', { name: editedEperson.name }));
        this.submitForm.emit(editedEperson);
      } else {
        this.notificationsService.error(this.translateService.get(this.labelPrefix + 'notification.edited.failure', { name: editedEperson.name }));
        this.cancelForm.emit();
      }
    });

    if (values.email != null && values.email !== ePerson.email) {
      this.showNotificationIfEmailInUse(editedEperson, 'edited');
    }
  }

  /**
   * Checks for the given ePerson if there is already an ePerson in the system with that email
   * and shows notification if this is the case
   * @param ePerson               ePerson values to check
   * @param notificationSection   whether in create or edit
   */
  private showNotificationIfEmailInUse(ePerson: EPerson, notificationSection: string) {
    // Relevant message for email in use
    this.subs.push(this.epersonService.searchByScope('email', ePerson.email, {
      currentPage: 1,
      elementsPerPage: 0
    }).pipe(getFirstSucceededRemoteData(), getRemoteDataPayload())
      .subscribe((list: PaginatedList<EPerson>) => {
        if (list.totalElements > 0) {
          this.notificationsService.error(this.translateService.get(this.labelPrefix + 'notification.' + notificationSection + '.failure.emailInUse', {
            name: ePerson.name,
            email: ePerson.email
          }));
        }
      }));
  }

  /**
   * Event triggered when the user changes page
   * @param event
   */
  onPageChange(event) {
    this.updateGroups({
      currentPage: event,
      elementsPerPage: this.config.pageSize
    });
  }

  /**
   * Update the list of groups by fetching it from the rest api or cache
   */
  private updateGroups(options) {
    this.subs.push(this.epersonService.getActiveEPerson().subscribe((eperson: EPerson) => {
      this.groups = this.groupsDataService.findAllByHref(eperson._links.groups.href, options);
    }));
  }

  /**
   * Start impersonating the EPerson
   */
  impersonate() {
    this.authService.impersonate(this.epersonInitial.id);
    this.isImpersonated = true;
  }

  /**
   * Deletes the EPerson from the Repository. The EPerson will be the only that this form is showing.
   * It'll either show a success or error message depending on whether the delete was successful or not.
   */
  delete() {
      this.epersonService.getActiveEPerson().pipe(take(1)).subscribe((eperson: EPerson) => {
        const modalRef = this.modalService.open(ConfirmationModalComponent);
        modalRef.componentInstance.dso = eperson;
        modalRef.componentInstance.headerLabel = 'confirmation-modal.delete-eperson.header';
        modalRef.componentInstance.infoLabel = 'confirmation-modal.delete-eperson.info';
        modalRef.componentInstance.cancelLabel = 'confirmation-modal.delete-eperson.cancel';
        modalRef.componentInstance.confirmLabel = 'confirmation-modal.delete-eperson.confirm';
        modalRef.componentInstance.response.pipe(take(1)).subscribe((confirm: boolean) => {
          if (confirm) {
            if (hasValue(eperson.id)) {
              this.epersonService.deleteEPerson(eperson).pipe(take(1)).subscribe((restResponse: RemoteData<NoContent>) => {
                if (restResponse.hasSucceeded) {
                  this.notificationsService.success(this.translateService.get(this.labelPrefix + 'notification.deleted.success', { name: eperson.name }));
                  this.reset();
                } else {
                  this.notificationsService.error('Error occured when trying to delete EPerson with id: ' + eperson.id + ' with code: ' + restResponse.statusCode + ' and message: ' + restResponse.errorMessage);
                }
                this.cancelForm.emit();
              })
            }}
        });
    })
  }

  /**
   * Stop impersonating the EPerson
   */
  stopImpersonating() {
    this.authService.stopImpersonatingAndRefresh();
    this.isImpersonated = false;
  }

  /**
   * Sends an email to current eperson address with the information
   * to reset password
   */
  resetPassword() {
    if (hasValue(this.epersonInitial.email)) {
      this.epersonRegistrationService.registerEmail(this.epersonInitial.email).pipe(getFirstCompletedRemoteData())
        .subscribe((response: RemoteData<Registration>) => {
        if (response.hasSucceeded) {
          this.notificationsService.success(this.translateService.get('admin.access-control.epeople.actions.reset'),
            this.translateService.get('forgot-email.form.success.content', {email: this.epersonInitial.email}));
        } else {
          this.notificationsService.error(this.translateService.get('forgot-email.form.error.head'),
            this.translateService.get('forgot-email.form.error.content', {email: this.epersonInitial.email}));
        }
      }
    );
    }
  }

  /**
   * Cancel the current edit when component is destroyed & unsub all subscriptions
   */
  ngOnDestroy(): void {
    this.onCancel();
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }

  /**
   * This method will ensure that the page gets reset and that the cache is cleared
   */
  reset() {
    this.epersonService.getActiveEPerson().pipe(take(1)).subscribe((eperson: EPerson) => {
      this.requestService.removeByHrefSubstring(eperson.self);
    });
    this.initialisePage();
  }

  private findInstitutionalScopedRoles(institutionalRole: Group): Observable<{name: string, scopes: Group[]}> {
    return this.groupsDataService.findAllByHref(institutionalRole._links.subgroups.href).pipe(
      getFirstSucceededRemoteDataPayload(),
      getPaginatedListPayload(),
      tap((groups) => {
        for (const group of groups) {
          this.institutionalRoleMap.set(group.id, institutionalRole);
        }
      }),
      map( (groups) => {
        return { name: institutionalRole.name, scopes: groups }
      })
    )
  }

  private initRoleValues(eperson: EPerson, roleMetadata: string) {
    const roleValues = {}
    eperson.allMetadata(roleMetadata)
      .forEach((metadata) => roleValues[metadata.authority] = true);
    return roleValues;
  }

  private initDynamicCheckboxModels(groups: Group[], rolesNoAvailable): DynamicCheckboxModel[] {
    const roleCheckboxModels = groups.map( (group) =>
      new DynamicCheckboxModel({
        id: group.id,
        label: group.name,
        value: false
      },
      {
        element: {
          control: 'btn-outline-info'
      }
      })
    );
    if ( roleCheckboxModels.length === 0) {
      roleCheckboxModels.push(new DynamicCheckboxModel({
        id: 'rolesNoAvailable',
        label: rolesNoAvailable,
        value: false,
        disabled: true
      }));
    }
    return roleCheckboxModels;
  }

  private getSelectedRoles() {
    return this.roles.group
      .filter((model) => model.value === true)
      .map((model) => new Object({
        value: model.label,
        authority: model.name,
        confidence: 600
      }));
  }

  private getSelectedInstitutionalRoles() {
    const roles = [];
    const institutionalRoleIds = [];
    for (const institutionalScopedRole of this.institutionalScopedRoles) {
      roles.push(...institutionalScopedRole.group
        .filter((model) => model.value === true)
        .map((model) => this.institutionalRoleMap.get(model.name))
        .filter((institutionalRole) => {
          const includes = institutionalRoleIds.includes(institutionalRole.id);
          institutionalRoleIds.push(institutionalRole.id);
          return !includes;
        })
        .map((institutionalRole) => new Object({
            value: institutionalRole.name,
            authority: institutionalRole.id,
            confidence: 600
          })
        ));
    }
    return roles;
  }

  private getSelectedInstitutionalScopedRoles() {
    const roles = [];
    for (const institutionalScopedRole of this.institutionalScopedRoles) {
      roles.push(...institutionalScopedRole.group
        .filter((model) => model.value === true)
        .map((model) => new Object({
          value: model.label,
          authority: model.name,
          confidence: 600
        })));
    }
    return roles;
  }

}
