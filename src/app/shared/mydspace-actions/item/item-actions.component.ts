import { Component, Injector, Input, OnInit } from '@angular/core';
import { ChangeDetectorRef, Component, Injector, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MyDSpaceActionsComponent } from '../mydspace-actions';
import { ItemDataService } from '../../../core/data/item-data.service';
import { Item } from '../../../core/shared/item.model';
import { NotificationsService } from '../../notifications/notifications.service';
import { RequestService } from '../../../core/data/request.service';
import { SearchService } from '../../../core/shared/search/search.service';
import { SubmissionService } from '../../../submission/submission.service';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { flatMap, map, switchMap, take } from 'rxjs/operators';
import { Relationship } from '../../../core/shared/item-relationships/relationship.model';
import { RelationshipService } from '../../../core/data/relationship.service';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { BehaviorSubject } from 'rxjs';
import { getItemPageRoute } from '../../../+item-page/item-page-routing-paths';

/**
 * This component represents mydspace actions related to Item object.
 */
@Component({
  selector: 'ds-item-actions',
  styleUrls: ['./item-actions.component.scss'],
  templateUrl: './item-actions.component.html',
})

export class ItemActionsComponent extends MyDSpaceActionsComponent<Item, ItemDataService> implements OnInit {

  /**
   * The Item object
   */
  @Input() object: Item;

  /**
   * Route to the item's page
   */
  itemPageRoute: string;

  canUpdate: boolean = null;

  canWithdraw: boolean = null;

  canReinstate: boolean = null;

  public processingAction$ = new BehaviorSubject<boolean>(false);

  public processingUpdate$ = new BehaviorSubject<boolean>(false);

  public processingWithdraw$ = new BehaviorSubject<boolean>(false);

  public processingReinstate$ = new BehaviorSubject<boolean>(false);

  /**
   * Initialize instance variables
   *
   * @param {Injector} injector
   * @param {Router} router
   * @param {NotificationsService} notificationsService
   * @param {TranslateService} translate
   * @param {SearchService} searchService
   * @param {RequestService} requestService
   */
  constructor(protected injector: Injector,
              protected router: Router,
              protected notificationsService: NotificationsService,
              protected translate: TranslateService,
              protected submissionService: SubmissionService,
              protected authorizationService: AuthorizationDataService,
              protected relationshipService: RelationshipService,
              protected _cdr: ChangeDetectorRef,
              protected searchService: SearchService,
              protected requestService: RequestService,
              protected notificationService: NotificationsService,
              protected translateService: TranslateService) {
    super(Item.type, injector, router, notificationsService, translate, searchService, requestService);
  }

  ngOnInit(): void {
    this.initPageRoute();
  }

  /**
   * Init the target object
   *
   * @param {Item} object
   */
  initObjects(object: Item) {
    this.object = object;
    this.initPageRoute();
  }

  /**
   * Initialise the route to the item's page
   */
  initPageRoute() {
    this.itemPageRoute = getItemPageRoute(this.object);
  }

  canBeCorrected(): Observable<boolean> {
    if (this.canUpdate !== null) {
      return of(this.canUpdate);
    }

    return this.itemHasPendingRequest().pipe(
      switchMap((hasPendingRequest) => {
        if (hasPendingRequest) {
          this.canUpdate = false;
          return of(this.canUpdate);
        }

        return this.authorizationService.isAuthorized(FeatureID.CanCorrectItem, this.object.self).pipe(
          take(1),
          switchMap((authorized) => {
            this.canUpdate = authorized;
            return of(this.canUpdate);
          })
        );

      })
    );
  }

  canBeWithdrawn(): Observable<boolean> {

    if (this.canWithdraw !== null) {
      return of(this.canWithdraw);
    }

    if (this.object.isWithdrawn) {
      this.canWithdraw = false;
      return of(this.canWithdraw);
    }

    return this.itemHasPendingRequest().pipe(
      switchMap((hasPendingRequest) => {

        if (hasPendingRequest) {
          this.canWithdraw = false;
          return of(this.canWithdraw);
        }

        return this.authorizationService.isAuthorized(FeatureID.CanWithdrawItem, this.object.self).pipe(
          take(1),
          switchMap((authorized) => {
            this.canWithdraw = authorized;
            return of(this.canWithdraw);
          })
        );

      })
    );
  }

  canBeReinstate(): Observable<boolean> {

    if (this.canReinstate !== null) {
      return of(this.canReinstate);
    }

    if (!this.object.isWithdrawn) {
      this.canReinstate = false;
      return of(this.canReinstate);
    }

    return this.itemHasPendingRequest().pipe(
      switchMap((hasPendingRequest) => {

        if (hasPendingRequest) {
          this.canReinstate = false;
          return of(this.canReinstate);
        }

        return this.authorizationService.isAuthorized(FeatureID.CanReinstateItem, this.object.self).pipe(
          take(1),
          switchMap((authorized) => {
            this.canReinstate = authorized;
            return of(this.canReinstate);
          })
        );

      })
    );
  }

  update() {
    this.processingUpdate$.next(true);
    this.processingAction$.next(true);
    this.submissionService.createSubmissionByItem(this.object.uuid, 'isCorrectionOfItem')
      .subscribe((submissionObject) => {
        this.processingUpdate$.next(false);
        this.processingAction$.next(false);
        this.canWithdraw = false;
        this.canUpdate = false;
        this.canReinstate = false;
        this.router.navigate(['/workspaceitems/' + submissionObject.id + '/edit']);
    });
  }

  withdraw() {
    this.processingWithdraw$.next(true);
    this.processingAction$.next(true);
    this.submissionService.createSubmissionByItem(this.object.uuid, 'isWithdrawOfItem').pipe(
      flatMap((submissionObject) => this.submissionService.depositSubmission(submissionObject._links.self.href))
    ).subscribe(() => {
      this.processingWithdraw$.next(false);
      this.processingAction$.next(false);
      this.canWithdraw = false;
      this.canUpdate = false;
      this.canReinstate = false;
      this.notificationService.success(this.translateService.get('submission.workflow.generic.withdraw.success'));
    });
  }

  reinstate() {
    this.processingReinstate$.next(true);
    this.processingAction$.next(true);
    this.submissionService.createSubmissionByItem(this.object.uuid, 'isReinstatementOfItem').pipe(
      flatMap((submissionObject) => this.submissionService.depositSubmission(submissionObject._links.self.href))
    ).subscribe(() => {
      this.processingReinstate$.next(false);
      this.processingAction$.next(false);
      this.canWithdraw = false;
      this.canUpdate = false;
      this.canReinstate = false;
      this.notificationService.success(this.translateService.get('submission.workflow.generic.reinstate.success'));
    });
  }

  itemHasPendingRequest(): Observable<boolean> {
    return this.itemHasRelation('isCorrectedByItem').pipe(
      switchMap((hasCorrectionRelation) => {
        if (hasCorrectionRelation) {
          return of(true);
        }

        return this.itemHasRelation('isWithdrawnByItem').pipe(
          switchMap((hasWithdrawRelation) => {
            if (hasWithdrawRelation) {
              return of(true);
            }

            return this.itemHasRelation('isReinstatedByItem');
          })
        );
      })
    );
  }

  itemHasRelation(relationship: string): Observable<boolean> {
    return this.relationshipService.getItemRelationshipsByLabel(this.object, relationship).pipe(
      getFirstSucceededRemoteDataPayload(),
      take(1),
      map((value: PaginatedList<Relationship>) => value.totalElements !== 0 )
    );
  }

}
