import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DynamicFormControlModel,
  DynamicFormLayout,
  DynamicInputModel,
  DynamicSelectModel,
  DynamicTextAreaModel,
  DynamicRadioGroupModel
} from '@ng-dynamic-forms/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { Subscription } from 'rxjs/internal/Subscription';
import { take, first } from 'rxjs/operators';
import { RestResponse } from '../../../../core/cache/response.models';
import { PaginatedList } from '../../../../core/data/paginated-list';
import { EPersonDataService } from '../../../../core/eperson/eperson-data.service';
import { GroupDataService } from '../../../../core/eperson/group-data.service';
import { Group } from '../../../../core/eperson/models/group.model';
import { getRemoteDataPayload, getSucceededRemoteData } from '../../../../core/shared/operators';
import { hasValue, isNotEmpty } from '../../../../shared/empty.util';
import { FormBuilderService } from '../../../../shared/form/builder/form-builder.service';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { deepClone } from 'fast-json-patch/lib/core';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';

@Component({
  selector: 'ds-group-form',
  templateUrl: './group-form.component.html'
})
/**
 * A form used for creating and editing groups
 */
export class GroupFormComponent implements OnInit, OnDestroy {

  messagePrefix = 'admin.access-control.groups.form';

  /**
   * A unique id used for ds-form
   */
  formId = 'group-form';

  /**
   * Dynamic models for the inputs of form
   */
  groupName: DynamicInputModel;
  groupDescription: DynamicTextAreaModel;
  groupType: DynamicSelectModel<string>;
  groupStatus: DynamicRadioGroupModel<string>;

  /**
   * A list of all dynamic input models
   */
  formModel: DynamicFormControlModel[];

  /**
   * Layout used for structuring the form inputs
   */
  formLayout: DynamicFormLayout = {
    groupName: {
      grid: {
        host: 'row'
      }
    },
    groupDescription: {
      grid: {
        host: 'row'
      }
    },
    groupType: {
      grid: {
        host: 'row'
      }
    },
    groupStatus: {
      grid: {
        host: 'row',
        option: 'btn-outline-info'
      }
    }
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
   * List of subscriptions
   */
  subs: Subscription[] = [];

  /**
   * Group currently being edited
   */
  groupBeingEdited: Group;

  constructor(public groupDataService: GroupDataService,
              private ePersonDataService: EPersonDataService,
              private formBuilderService: FormBuilderService,
              private translateService: TranslateService,
              private notificationsService: NotificationsService,
              private route: ActivatedRoute,
              protected router: Router) {
  }

  ngOnInit() {
    this.subs.push(this.route.params.subscribe((params) => {
      this.setActiveGroup(params.groupId)
    }));
    combineLatest(
      this.translateService.get(`${this.messagePrefix}.groupName`),
      this.translateService.get(`${this.messagePrefix}.groupDescription`),
      this.translateService.get(`${this.messagePrefix}.groupType`),
      this.translateService.get(`${this.messagePrefix}.groupType.normal`),
      this.translateService.get(`${this.messagePrefix}.groupType.role`),
      this.translateService.get(`${this.messagePrefix}.groupType.institutional`),
      this.translateService.get(`${this.messagePrefix}.groupType.scoped`),
      this.translateService.get(`${this.messagePrefix}.groupStatus`),
      this.translateService.get(`${this.messagePrefix}.groupStatus.enabled`),
      this.translateService.get(`${this.messagePrefix}.groupStatus.disabled`),
      this.groupDataService.getActiveGroup()
    ).subscribe(([groupName, groupDescription, groupType, normalType, roleType, institutionalType, scopedType,
                  groupStatus, enabledStatus, disabledStatus, activeGroup]) => {

      this.groupName = new DynamicInputModel({
        id: 'groupName',
        label: groupName,
        name: 'groupName',
        validators: {
          required: null,
        },
        required: true,
      });

      this.groupDescription = new DynamicTextAreaModel({
        id: 'groupDescription',
        label: groupDescription,
        name: 'groupDescription',
        required: false,
      });

      const groupTypeOptions = [
        {label: normalType, value: 'NORMAL', disabled: false},
        {label: roleType, value: 'ROLE', disabled: false},
        {label: institutionalType, value: 'INSTITUTIONAL', disabled: false}
      ];
      if (activeGroup != null) {
        groupTypeOptions.push({label: scopedType, value: 'SCOPED', disabled:true});
      }
      this.groupType = new DynamicSelectModel<string>({
        id: 'groupType',
        name: 'groupType',
        options: groupTypeOptions,
        label: groupType,
        value: 'NORMAL'
      });

      this.groupStatus = new DynamicRadioGroupModel<string>({
        id: 'groupStatus',
        name: 'groupStatus',
        options: [{label: enabledStatus, value: 'ENABLED'},{label: disabledStatus, value: 'DISABLED'}],
        label: groupStatus,
        value: 'ENABLED'
      });
      this.formModel = [
        this.groupName,
        this.groupDescription,
        this.groupType
      ];

      if (activeGroup && !activeGroup.permanent) {
        this.formModel.push(this.groupStatus);
      }

      this.formGroup = this.formBuilderService.createFormGroup(this.formModel);

      if (activeGroup != null) {
        this.groupBeingEdited = activeGroup;
        this.formGroup.patchValue({
          groupName: activeGroup != null ? activeGroup.name : '',
          groupDescription: activeGroup != null ? activeGroup.firstMetadataValue('dc.description') : '',
          groupType: activeGroup != null && activeGroup.firstMetadataValue('perucris.group.type') != null ?
              activeGroup.firstMetadataValue('perucris.group.type') : 'NORMAL',
          groupStatus: activeGroup != null && activeGroup.firstMetadataValue('perucris.group.status') != null ?
              activeGroup.firstMetadataValue('perucris.group.status') : 'ENABLED'
        });

        if (activeGroup.permanent) {
          this.formGroup.get('groupName').disable();
        }

        this.formGroup.get('groupType').disable();

        this.groupStatus.value = activeGroup != null && activeGroup.firstMetadataValue('perucris.group.status') != null ?
          activeGroup.firstMetadataValue('perucris.group.status') : 'ENABLED';
      }
    });
  }

  /**
   * Stop editing the currently selected group
   */
  onCancel() {
    this.groupDataService.cancelEditGroup();
    this.cancelForm.emit();
    this.router.navigate([this.groupDataService.getGroupRegistryRouterLink()]);
  }

  /**
   * Submit the form
   * When the eperson has an id attached -> Edit the eperson
   * When the eperson has no id attached -> Create new eperson
   * Emit the updated/created eperson using the EventEmitter submitForm
   */
  onSubmit() {
    this.groupDataService.getActiveGroup().pipe(take(1)).subscribe(
      (group: Group) => {
        const values = {
          name: this.groupName.value,
          metadata: {
            'dc.description': [
              {
                value: this.groupDescription.value
              }
            ],
            'perucris.group.type': [
              {
                value: this.groupType.value
              }
            ],
            'perucris.group.status': [
              {
                value: this.groupStatus.value
              }
            ]
          },
        };
        if (group === null) {
          this.createNewGroup(values);
        } else {
          this.editGroup(group, values);
        }
      }
    );
  }

  /**
   * Creates new Group based on given values from form
   * @param values
   */
  createNewGroup(values) {
    const groupToCreate = Object.assign(new Group(), values);
    const response = this.groupDataService.tryToCreate(groupToCreate);
    response.pipe(take(1)).subscribe((restResponse: RestResponse) => {
      if (restResponse.isSuccessful) {
        this.notificationsService.success(this.translateService.get(this.messagePrefix + '.notification.created.success', { name: groupToCreate.name }));
        this.submitForm.emit(groupToCreate);
        const resp: any = restResponse;
        if (isNotEmpty(resp.resourceSelfLinks)) {
          const groupSelfLink = resp.resourceSelfLinks[0];
          this.setActiveGroupWithLink(groupSelfLink);
          this.router.navigateByUrl(this.groupDataService.getGroupEditPageRouterLinkWithID(this.groupDataService.getUUIDFromString(groupSelfLink)));
        }
      } else {
        this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.created.failure', { name: groupToCreate.name }));
        this.showNotificationIfNameInUse(groupToCreate, 'created');
        this.cancelForm.emit();
      }
    });
  }

  /**
   * Checks for the given group if there is already a group in the system with that group name and shows error if that
   * is the case
   * @param group                 group to check
   * @param notificationSection   whether in create or edit
   */
  private showNotificationIfNameInUse(group: Group, notificationSection: string) {
    // Relevant message for group name in use
    this.subs.push(this.groupDataService.searchGroups(group.name, {
      currentPage: 1,
      elementsPerPage: 0
    }).pipe(getSucceededRemoteData(), getRemoteDataPayload())
      .subscribe((list: PaginatedList<Group>) => {
        if (list.totalElements > 0) {
          this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.' + notificationSection + '.failure.groupNameInUse', {
            name: group.name
          }));
        }
      }));
  }

  /**
   * Edit the group information with new values
   * @param group
   * @param values
   */
  editGroup(group: Group, values) {
    const editedGroup = Object.assign(deepClone(group), {
      id: group.id,
      name: (hasValue(values.name) ? values.name : group.name),
      permanent: (hasValue(values.permanent) ? values.permanent : group.permanent),
      handle: (hasValue(values.handle) ? values.handle : group.handle),
      _links: group._links,
    });

    if ( this.groupDescription && this.groupDescription.value) {
      this.addOrReplaceMetadataValue(group, editedGroup, 'dc.description', this.groupDescription.value);
    }

    if ( this.groupStatus && this.groupStatus.value) {
      this.addOrReplaceMetadataValue(group, editedGroup, 'perucris.group.status', this.groupStatus.value);
    }

    this.groupDataService
        .updateGroup(editedGroup)
        .pipe(first())
        .subscribe((response: any) => {
          if (response.isSuccessful) {
            this.notificationsService.success(
              this.translateService.get('admin.access-control.groups.notification.edit.success', { name: group.name }));
            this.groupDataService.clearGroupLinkRequests(group._links.subgroups.href);
            this.groupDataService.clearGroupLinkRequests(group._links.epersons.href);
            this.router.navigate(['groups']);
          } else {
            this.notificationsService.error(
              this.translateService.get('admin.access-control.groups.notification.edit.failure', { name: group.name }));
          }
        });
  }

  /**
   * Start editing the selected group
   * @param groupId   ID of group to set as active
   */
  setActiveGroup(groupId: string) {
    this.groupDataService.cancelEditGroup();
    this.groupDataService.findById(groupId)
      .pipe(
        getSucceededRemoteData(),
        getRemoteDataPayload())
      .subscribe((group: Group) => {
        this.groupDataService.editGroup(group);
      });
  }

  /**
   * Start editing the selected group
   * @param groupSelfLink   SelfLink of group to set as active
   */
  setActiveGroupWithLink(groupSelfLink: string) {
    this.groupDataService.getActiveGroup().pipe(take(1)).subscribe((activeGroup: Group) => {
      if (activeGroup === null) {
        this.groupDataService.cancelEditGroup();
        this.groupDataService.findByHref(groupSelfLink)
          .pipe(
            getSucceededRemoteData(),
            getRemoteDataPayload())
          .subscribe((group: Group) => {
            this.groupDataService.editGroup(group);
          })
      }
    });
  }

  /**
   * Cancel the current edit when component is destroyed & unsub all subscriptions
   */
  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    this.onCancel();
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }

  private addOrReplaceMetadataValue(dspaceObject: DSpaceObject, editedObject: any, metadataField: string, value: string | string[]) {
    if (dspaceObject.hasMetadata(metadataField)) {
      editedObject.metadata[metadataField][0].value = value;
    } else {
      editedObject.metadata[metadataField] = [Object.assign<any,any>({}, {value: value})];
    }
  }
}
