import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ClaimedTaskActionsAbstractComponent } from '../abstract/claimed-task-actions-abstract.component';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';
import { Router } from '@angular/router';
import { NotificationsService } from '../../../notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { SearchService } from '../../../../core/shared/search/search.service';
import { RequestService } from '../../../../core/data/request.service';
import { RemoteData } from '../../../../core/data/remote-data';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { of } from 'rxjs/internal/observable/of';
import { ClaimedDeclinedTaskSearchResult } from '../../../object-collection/shared/claimed-declined-task-search-result.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFirstSucceededRemoteDataPayload } from '../../../../core/shared/operators';
import { WorkflowItemDataService } from '../../../../core/submission/workflowitem-data.service';

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

  constructor(protected injector: Injector,
              protected router: Router,
              protected notificationsService: NotificationsService,
              protected translate: TranslateService,
              protected searchService: SearchService,
              protected requestService: RequestService,
              private formBuilder: FormBuilder,
              private modalService: NgbModal,
              private workflowItemService: WorkflowItemDataService) {
    super(injector, router, notificationsService, translate, searchService, requestService);
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
   * Submit a reject option for the task
   */
  submitTask() {
    this.modalRef.close('Send Button');
    super.submitTask();
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
   * Open modal
   *
   * @param content
   */
  openRejectModal(content: any) {
    this.rejectForm.reset();
    this.modalRef = this.modalService.open(content);
  }

  reloadObjectExecution(): Observable<RemoteData<DSpaceObject> | DSpaceObject> {
    return of(this.object);
  }

  convertReloadedObject(dso: DSpaceObject): DSpaceObject {
    const reloadedObject = Object.assign(new ClaimedDeclinedTaskSearchResult(), dso, {
      indexableObject: dso
    });
    return reloadedObject;
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
