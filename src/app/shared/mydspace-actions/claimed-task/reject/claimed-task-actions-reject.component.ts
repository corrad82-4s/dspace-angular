import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ClaimedTaskActionsAbstractComponent } from '../abstract/claimed-task-actions-abstract.component';
import { ClaimedTaskDataService } from '../../../../core/tasks/claimed-task-data.service';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { WorkflowItemDataService } from 'src/app/core/submission/workflowitem-data.service';

export const WORKFLOW_TASK_OPTION_REJECT = 'submit_reject';

@rendersWorkflowTaskOption(WORKFLOW_TASK_OPTION_REJECT)
@Component({
  selector: 'ds-claimed-task-actions-reject',
  styleUrls: ['./claimed-task-actions-reject.component.scss'],
  templateUrl: './claimed-task-actions-reject.component.html',
})
/**
 * Component for displaying and processing the reject action on a workflow task item
 */
export class ClaimedTaskActionsRejectComponent extends ClaimedTaskActionsAbstractComponent implements OnInit {
  /**
   * This component represents the reject option
   */
  option = WORKFLOW_TASK_OPTION_REJECT;

  /**
   * The reject form group
   */
  public rejectForm: FormGroup;

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
              private workflowItemService: WorkflowItemDataService) {
    super(claimedTaskService);
  }

  /**
   * Initialize form
   */
  ngOnInit() {
    this.rejectForm = this.formBuilder.group({
      reason: ['', Validators.required]
    });
  }

  /**
   * Create the request body for rejecting a workflow task
   * Includes the reason from the form
   */
  createbody(): any {
    const reason = this.rejectForm.get('reason').value;
    return Object.assign(super.createbody(), { reason });
  }

  /**
   * Submit a reject option for the task
   */
  submitTask() {
    this.modalRef.close('Send Button');
    super.submitTask();
  }

  /**
   * Open modal if no duplication occurs, otherwise submit the task
   *
   * @param content
   */
  reject(content: any) {
    this.hasDuplicationVerified().subscribe((hasDuplicationVerified) => {
      if (hasDuplicationVerified) {
        super.submitTask();
      } else {
        this.rejectForm.reset();
        this.modalRef = this.modalService.open(content);
      }
    });
  }

  hasNotDuplications(): Observable<boolean> {
    return this.workflowItemService.findByHref(this.object._links.workflowitem.href).pipe(
      getFirstSucceededRemoteDataPayload(),
      map((workflowitem) => !this.workflowItemService.hasDuplications(workflowitem))
    );
  }

  hasDuplicationVerified(): Observable<boolean> {
    return this.workflowItemService.findByHref(this.object._links.workflowitem.href).pipe(
      getFirstSucceededRemoteDataPayload(),
      map((workflowitem) => this.workflowItemService.hasDuplicationVerified(workflowitem))
    );
  }

  getLabelPrefix(): Observable<string> {
    return this.hasDuplicationVerified().pipe(
      map((hasDuplicationVerified) => 'submission.workflow.tasks.claimed.' + (hasDuplicationVerified ? 'discard' : 'reject'))
    );
  }

  getHelpLabelPrefix(): Observable<string> {
    return this.getLabelPrefix().pipe(
      map((labelPrefix) => labelPrefix + '_help')
    );
  }
}
