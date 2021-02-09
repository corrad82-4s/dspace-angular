import { Component } from '@angular/core';
import { ClaimedTaskActionsAbstractComponent } from '../abstract/claimed-task-actions-abstract.component';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';
import { ClaimedTaskDataService } from '../../../../core/tasks/claimed-task-data.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { WorkflowItemDataService } from '../../../../core/submission/workflowitem-data.service';
import { getFirstSucceededRemoteDataPayload } from '../../../../core/shared/operators';

export const WORKFLOW_TASK_OPTION_APPROVE = 'submit_approve';

@rendersWorkflowTaskOption(WORKFLOW_TASK_OPTION_APPROVE)
@Component({
  selector: 'ds-claimed-task-actions-approve',
  styleUrls: ['./claimed-task-actions-approve.component.scss'],
  templateUrl: './claimed-task-actions-approve.component.html',
})
/**
 * Component for displaying and processing the approve action on a workflow task item
 */
export class ClaimedTaskActionsApproveComponent extends ClaimedTaskActionsAbstractComponent {
  /**
   * This component represents the approve option
   */
  option = WORKFLOW_TASK_OPTION_APPROVE;

  constructor(protected claimedTaskService: ClaimedTaskDataService,
              protected workflowItemService: WorkflowItemDataService) {
    super(claimedTaskService);
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
      map((hasDuplicationVerified) => 'submission.workflow.tasks.claimed.' + (hasDuplicationVerified ? 'choose_as_target' : 'approve'))
    );
  }

  getHelpLabelPrefix(): Observable<string> {
    return this.getLabelPrefix().pipe(
      map((labelPrefix) => labelPrefix + '_help')
    );
  }

}
