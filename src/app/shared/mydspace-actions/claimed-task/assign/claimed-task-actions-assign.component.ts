import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, Observable, of } from 'rxjs';
import { flatMap, map, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { RemoteData } from 'src/app/core/data/remote-data';
import { EPersonDataService } from 'src/app/core/eperson/eperson-data.service';
import { GroupDataService } from 'src/app/core/eperson/group-data.service';
import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { Group } from 'src/app/core/eperson/models/group.model';
import { Collection } from 'src/app/core/shared/collection.model';
import { getFirstSucceededRemoteDataPayload, getFirstSucceededRemoteListPayload } from 'src/app/core/shared/operators';
import { WorkflowItemDataService } from 'src/app/core/submission/workflowitem-data.service';
import { WorkflowStepDataService } from 'src/app/core/submission/workflowstep-data.service';
import { ClaimedTaskDataService } from '../../../../core/tasks/claimed-task-data.service';
import { ClaimedTaskActionsAbstractComponent } from '../abstract/claimed-task-actions-abstract.component';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';

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
 constructor(protected claimedTaskService: ClaimedTaskDataService,
             private formBuilder: FormBuilder,
             private modalService: NgbModal,
             private collectionService: CollectionDataService,
             private workflowItemService: WorkflowItemDataService,
             private workflowStepService: WorkflowStepDataService,
             private groupService: GroupDataService,
             private ePersonService: EPersonDataService,
             private authService: AuthService) {
   super(claimedTaskService);
 }

 /**
   * Initialize form
   */
  ngOnInit() {
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
        getFirstSucceededRemoteDataPayload(),
        flatMap((group) => this.ePersonService.findAllByHref(group._links.allMembers.href)),
        getFirstSucceededRemoteListPayload()
      ), 
      this.authService.getAuthenticatedUserFromStore()
    ).subscribe((([members, currentUser]) => {
      this.members$ = of(members.filter(member => member.id !== currentUser.uuid));
      this.modalRef = this.modalService.open(content);
      })
    );
  }

  private getCurrentWorkflowGroup(collection: Collection) : Observable<RemoteData<Group>> {
    return this.workflowStepService.findByHref(this.object._links.step.href).pipe(
      getFirstSucceededRemoteDataPayload(),
      map((step) => collection._links.workflowGroups.find((link) => link.name === step.roleId)),
      flatMap((groupLink) => this.groupService.findByHref(groupLink.href)),
    );
  } 
  

}
