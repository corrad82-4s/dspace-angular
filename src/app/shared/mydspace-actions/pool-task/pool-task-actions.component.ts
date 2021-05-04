import { Component, Injector, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import {filter, map, switchMap, take} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { WorkflowItem } from '../../../core/submission/models/workflowitem.model';
import { ProcessTaskResponse } from '../../../core/tasks/models/process-task-response';
import { WorkflowStepDataService } from '../../../core/submission/workflowstep-data.service';
import { RemoteData } from '../../../core/data/remote-data';
import { PoolTask } from '../../../core/tasks/models/pool-task-object.model';
import { PoolTaskDataService } from '../../../core/tasks/pool-task-data.service';
import { isNotUndefined } from '../../empty.util';
import { NotificationsService } from '../../notifications/notifications.service';
import { RequestService } from '../../../core/data/request.service';
import { SearchService } from '../../../core/shared/search/search.service';
import { ClaimedTaskDataService } from '../../../core/tasks/claimed-task-data.service';
import { getFirstSucceededRemoteData, getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { Item } from '../../../core/shared/item.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { MyDSpaceReloadableActionsComponent } from '../mydspace-reloadable-actions';

/**
 * This component represents mydspace actions related to PoolTask object.
 */
@Component({
  selector: 'ds-pool-task-actions',
  styleUrls: ['./pool-task-actions.component.scss'],
  templateUrl: './pool-task-actions.component.html',
})
export class PoolTaskActionsComponent extends MyDSpaceReloadableActionsComponent<PoolTask, PoolTaskDataService> implements OnDestroy {

  /**
   * The PoolTask object
   */
  @Input() object: PoolTask;

  /**
   * The workflowitem object that belonging to the PoolTask object
   */
  public workflowitem$: Observable<WorkflowItem>;

  /**
   * Anchor used to reload the pool task.
   */
  public itemUuid: string;

  subs = [];

  /**
   * Initialize instance variables
   *
   * @param {Injector} injector
   * @param {Router} router
   * @param {NotificationsService} notificationsService
   * @param {TranslateService} translate
   * @param {SearchService} searchService
   * @param {RequestService} requestService
   * @param {WorkflowStepDataService} workflowStepService
   */
  constructor(protected injector: Injector,
              protected router: Router,
              protected notificationsService: NotificationsService,
              protected claimedTaskService: ClaimedTaskDataService,
              protected translate: TranslateService,
              protected searchService: SearchService,
              protected requestService: RequestService,
              protected workflowStepService: WorkflowStepDataService) {
    super(PoolTask.type, injector, router, notificationsService, translate, searchService, requestService);
  }



  /**
   * Init the PoolTask and WorkflowItem objects
   *
   * @param {PoolTask} object
   */
  initObjects(object: PoolTask) {
    this.object = object;
    this.workflowitem$ = (this.object.workflowitem as Observable<RemoteData<WorkflowItem>>).pipe(
      filter((rd: RemoteData<WorkflowItem>) => ((!rd.isRequestPending) && isNotUndefined(rd.payload))),
      map((rd: RemoteData<WorkflowItem>) => rd.payload),
      take(1));
  }

  actionExecution(): Observable<ProcessTaskResponse> {
    return this.objectDataService.getPoolTaskEndpointById(this.object.id)
      .pipe(switchMap((poolTaskHref) => {
        return this.claimedTaskService.claimTask(this.object.id, poolTaskHref);
    }));
  }

  reloadObjectExecution(): Observable<RemoteData<DSpaceObject> | DSpaceObject> {
    return this.claimedTaskService.findByItem(this.itemUuid).pipe(take(1));
  }

  /**
   * Claim the task.
   */
  claim() {
    this.subs.push(this.startActionExecution().pipe(take(1)).subscribe());
  }

  /**
   * Retrieve the itemUuid.
   */
  initReloadAnchor() {
    (this.object as any).workflowitem.pipe(
      getFirstSucceededRemoteDataPayload(),
      switchMap((workflowItem: WorkflowItem) => workflowItem.item.pipe(getFirstSucceededRemoteDataPayload())
      ))
      .subscribe((item: Item) => {
      this.itemUuid = item.uuid;
    });
  }

  isInstitutionRejectionTask(): Observable<boolean> {
    return this.workflowStepService.findByHref(this.object._links.step.href).pipe(
      getFirstSucceededRemoteData(),
      map((workflowStep) => workflowStep.payload && workflowStep.payload.id === 'waitForConcytecStep')
    );
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }



}
