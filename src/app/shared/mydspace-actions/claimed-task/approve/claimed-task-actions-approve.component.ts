import { Component, Injector } from '@angular/core';
import { ClaimedTaskActionsAbstractComponent } from '../abstract/claimed-task-actions-abstract.component';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';
import { Observable } from 'rxjs';
import { RemoteData } from '../../../../core/data/remote-data';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { Router } from '@angular/router';
import { NotificationsService } from '../../../notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { SearchService } from '../../../../core/shared/search/search.service';
import { RequestService } from '../../../../core/data/request.service';
import { ClaimedApprovedTaskSearchResult } from '../../../object-collection/shared/claimed-approved-task-search-result.model';
import { of } from 'rxjs/internal/observable/of';
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

  constructor(protected injector: Injector,
              protected router: Router,
              protected notificationsService: NotificationsService,
              protected translate: TranslateService,
              protected searchService: SearchService,
              protected requestService: RequestService,
              protected workflowItemService: WorkflowItemDataService) {
    super(injector, router, notificationsService, translate, searchService, requestService);
  }

  reloadObjectExecution(): Observable<RemoteData<DSpaceObject> | DSpaceObject> {
    return of(this.object);
  }

  convertReloadedObject(dso: DSpaceObject): DSpaceObject {
    const reloadedObject = Object.assign(new ClaimedApprovedTaskSearchResult(), dso, {
      indexableObject: dso
    });
    return reloadedObject;
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
