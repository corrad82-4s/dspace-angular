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
import { map, switchMap, take } from 'rxjs/operators';
import { Relationship } from '../../../core/shared/item-relationships/relationship.model';
import { RelationshipService } from '../../../core/data/relationship.service';
import { PaginatedList } from '../../../core/data/paginated-list';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

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
              protected requestService: RequestService) {
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
    return this.authorizationService.isAuthorized(FeatureID.CanCorrectItem, this.object.self)
      .pipe(
        take(1),
        switchMap((authorized) => {
          if (!authorized) {
            this.canUpdate = false;
            return of(this.canUpdate);
          }
          return this.relationshipService.getItemRelationshipsByLabel(this.object, 'isCorrectionOfItem').pipe(
            getFirstSucceededRemoteDataPayload(),
            take(1),
            map((value: PaginatedList<Relationship>) => {
             this.canUpdate = value.totalElements === 0;
             return this.canUpdate;
            })
          );
        }));
  }

  update() {
    this.submissionService.createSubmissionByItem(this.object.uuid, 'isCorrectionOfItem')
      .subscribe((submissionObject) => {
        this.router.navigate(['/workspaceitems/' + submissionObject.id + '/edit']);
    })
  }

}
