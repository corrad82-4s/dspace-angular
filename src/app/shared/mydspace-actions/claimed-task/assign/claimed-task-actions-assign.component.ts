import { AuthService } from './../../../../core/auth/auth.service';
import { Component, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { CollectionDataService } from '../../../../core/data/collection-data.service';
import { EPersonDataService } from '../../../../core/eperson/eperson-data.service';
import { GroupDataService } from '../../../../core/eperson/group-data.service';
import { EPerson } from '../../../../core/eperson/models/eperson.model';
import { Group } from '../../../../core/eperson/models/group.model';
import { Collection } from '../../../../core/shared/collection.model';
import { getFirstSucceededRemoteDataPayload, getFirstSucceededRemoteListPayload } from '../../../../core/shared/operators';
import { WorkflowItemDataService } from '../../../../core/submission/workflowitem-data.service';
import { WorkflowStepDataService } from '../../../../core/submission/workflowstep-data.service';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { ClaimedTaskActionsAbstractComponent } from '../abstract/claimed-task-actions-abstract.component';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';
import { Router } from '@angular/router';
import { SearchService } from '../../../../core/shared/search/search.service';
import { RequestService } from '../../../../core/data/request.service';
import { ClaimedTask } from '../../../../core/tasks/models/claimed-task-object.model';

export const WORKFLOW_TASK_OPTION_ASSIGN = 'submit_assign';

@rendersWorkflowTaskOption(WORKFLOW_TASK_OPTION_ASSIGN)
@Component({
  selector: 'ds-claimed-task-actions-assign',
  templateUrl: './claimed-task-actions-assign.component.html',
})
/**
 * Component for displaying and processing the assign action on a workflow task item
 */
export class ClaimedTaskActionsAssignComponent extends ClaimedTaskActionsAbstractComponent {
  /**
   * This component represents the assign option
   */
  option = WORKFLOW_TASK_OPTION_ASSIGN;

  collection: Collection;

  members$: Observable<EPerson[]>;

  /**
   * The assign form group
   */
  public assignForm: FormGroup;

  /**
   * Reference to NgbModal
   */
  public modalRef: NgbModalRef;

 /**
  * Initialize instance variables
  *
  * @param {FormBuilder} formBuilder
  * @param {NgbModal} modalService
  * @param claimedTaskService
  */
 constructor(
             protected injector: Injector,
             protected router: Router,
             protected notificationsService: NotificationsService,
             protected translate: TranslateService,
             protected searchService: SearchService,
             protected requestService: RequestService,
              // protected claimedTaskService: ClaimedTaskDataService,
             private formBuilder: FormBuilder,
             private modalService: NgbModal,
             private collectionService: CollectionDataService,
             private workflowItemService: WorkflowItemDataService,
             private workflowStepService: WorkflowStepDataService,
             private groupService: GroupDataService,
             private ePersonService: EPersonDataService,
             private authService: AuthService,
             private notificationService: NotificationsService,
             private translateService: TranslateService) {
   // super(claimedTaskService);
   super(injector, router, notificationsService, translate, searchService, requestService);
 }

  initObjects(object: ClaimedTask) {
    super.initObjects(object);

    this.assignForm = this.formBuilder.group({
      user: ['', Validators.required]
    });
  }

  /**
   * Create the request body to assign a workflow task
   * Includes the user from the form
   */
  createbody(): any {
    const user = this.assignForm.get('user').value;
    return Object.assign(super.createbody(), { user });
  }

  /**
   * Submit a assign option for the task
   */
  submitTask() {
    this.modalRef.close('Send Button');
    super.submitTask();
  }

  /**
   * Open modal
   *
   * @param content
   */
  openAssignModal(content: any) {
    this.assignForm.reset();
    combineLatest(
      this.workflowItemService.findByHref(this.object._links.workflowitem.href).pipe(
        getFirstSucceededRemoteDataPayload(),
        flatMap((workflowItem) => this.collectionService.findByHref(workflowItem._links.collection.href)),
        getFirstSucceededRemoteDataPayload(),
        flatMap((collection) => this.getCurrentWorkflowGroup(collection)),
        flatMap((group) => this.ePersonService.findAllByHref(group._links.allMembers.href)),
        getFirstSucceededRemoteListPayload()
      ),
      this.authService.getAuthenticatedUserFromStore()
    ).subscribe((([members, currentUser]) => {
      members = members.filter((member) => member.id !== currentUser.uuid);
      if (members.length === 0) {
        this.notificationService.warning((this.translateService.get('submission.workflow.tasks.claimed.assign.user.no-member')));
      } else {
        this.members$ = of(members);
        this.modalRef = this.modalService.open(content);
      }
    }));
  }

  private getCurrentWorkflowGroup(collection: Collection): Observable<Group> {
    return this.workflowStepService.findByHref(this.object._links.step.href).pipe(
      getFirstSucceededRemoteDataPayload(),
      flatMap((step) => this.groupService.searchBy('byWorkflowRole', {
        searchParams: [
          { fieldName: 'workflowRole', fieldValue: step.roleId },
          { fieldName: 'collection', fieldValue: collection.uuid }
        ]}
      )),
      getFirstSucceededRemoteListPayload(),
      map((groups) => groups[0])
    );
  }

}
