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

/**
 * This component represents mydspace actions related to Item object.
 */
@Component({
  selector: 'ds-item-actions',
  styleUrls: ['./item-actions.component.scss'],
  templateUrl: './item-actions.component.html',
})

export class ItemActionsComponent extends MyDSpaceActionsComponent<Item, ItemDataService> {

  /**
   * The Item object
   */
  @Input() object: Item;

  canUpdate: boolean = null;

  canWithdraw: boolean = null;

  public processingAction$ = new BehaviorSubject<boolean>(false);

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

  /**
   * Init the target object
   *
   * @param {Item} object
   */
  initObjects(object: Item) {
    this.object = object;
  }

  canBeCorrected(): Observable<boolean> {
    if (this.canUpdate !== null) {
      return of(this.canUpdate);
    }

    return this.itemHasNotRelation('isWithdrawOfItem').pipe(
      switchMap((hasNotWithdrawRelation) => {

        if (!hasNotWithdrawRelation) {
          this.canUpdate = false;
          return of(this.canUpdate);
        }

        return this.authorizationService.isAuthorized(FeatureID.CanCorrectItem, this.object.self).pipe(
          take(1),
          switchMap((authorized) => {

            if (!authorized) {
              this.canUpdate = false;
              return of(this.canUpdate);
            }

            return this.itemHasNotRelation('isCorrectionOfItem').pipe(
              map((hasNotRelation: boolean) => {
                this.canUpdate = hasNotRelation;
                return this.canUpdate;
              })
            );

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

    return this.itemHasNotRelation('isCorrectionOfItem').pipe(
      switchMap((hasNotCorrectionRelation) => {

        if (!hasNotCorrectionRelation) {
          this.canWithdraw = false;
          return of(this.canWithdraw);
        }

        return this.authorizationService.isAuthorized(FeatureID.CanWithdrawItem, this.object.self).pipe(
          take(1),
          switchMap((authorized) => {

            if (!authorized) {
              this.canWithdraw = false;
              return of(this.canWithdraw);
            }

            return this.itemHasNotRelation('isWithdrawOfItem').pipe(
              map((hasNotRelation: boolean) => {
                this.canWithdraw = hasNotRelation;
                return this.canWithdraw;
              })
            );

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

    return this.relationshipService.getItemRelationshipsByLabel(this.object, 'isWithdrawOfItem').pipe(
      getFirstSucceededRemoteDataPayload(),
      take(1),
      map((value: PaginatedList<Relationship>) => {
        console.log(value);
        this.canWithdraw = value.totalElements === 0;
        return this.canWithdraw;
      })
    );
  }

  update() {
    this.submissionService.createSubmissionByItem(this.object.uuid, 'isCorrectionOfItem')
      .subscribe((submissionObject) => {
        this.router.navigate(['/workspaceitems/' + submissionObject.id + '/edit']);
    });
  }

  withdraw() {
    this.processingAction$.next(true);
    this.submissionService.createSubmissionByItem(this.object.uuid, 'isWithdrawOfItem').pipe(
      flatMap((submissionObject) => this.submissionService.depositSubmission(submissionObject._links.self.href))
    ).subscribe(() => {
      this.processingAction$.next(false);
      this.canWithdraw = false;
      this.canUpdate = false;
      this.notificationService.success(this.translateService.get('submission.workflow.generic.withdraw.success'));
    });
  }

  itemHasNotRelation(relationship: string): Observable<boolean> {
    return this.relationshipService.getItemRelationshipsByLabel(this.object, relationship).pipe(
      getFirstSucceededRemoteDataPayload(),
      take(1),
      map((value: PaginatedList<Relationship>) => value.totalElements === 0 )
    );
  }

  withdraw() {
    this.processingAction$.next(true);
    this.submissionService.createSubmissionByItem(this.object.uuid, 'isWithdrawOfItem').pipe(
      flatMap((submissionObject) => this.submissionService.depositSubmission(submissionObject._links.self.href))
    ).subscribe(() => {
      this.processingAction$.next(false);
      this.canWithdraw = false;
      this.notificationService.success(this.translateService.get('submission.workflow.generic.withdraw.success'))
    })
  }

}
