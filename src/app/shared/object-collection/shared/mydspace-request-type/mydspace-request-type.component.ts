import { Component, Input } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ItemDataService } from 'src/app/core/data/item-data.service';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RelationshipService } from 'src/app/core/data/relationship.service';
import { Relationship } from 'src/app/core/shared/item-relationships/relationship.model';
import { Item } from 'src/app/core/shared/item.model';
import { getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { SubmissionObject } from 'src/app/core/submission/models/submission-object.model';


@Component({
  selector: 'ds-mydspace-request-type',
  templateUrl: './mydspace-request-type.component.html',
})
export class MyDSpaceRequestTypeComponent {

  @Input()
  submissionObject: SubmissionObject;

  private newSubmissionRequest: boolean = null;
  private correctionRequest: boolean = null;
  private withdrawRequest: boolean = null;
  private reinstateRequest: boolean = null;

  constructor(
    protected relationshipService: RelationshipService,
    protected itemService: ItemDataService) {

  }

  isNewSubmissionRequest(): Observable<boolean> {
    if (this.newSubmissionRequest !== null) {
      return of(this.newSubmissionRequest);
    }

    return combineLatest( [ this.isCorrectionRequest(), this.isWithdrawRequest(), this.isReinstateRequest()]).pipe(
      map(([isCorrection, isWithdraw, isReinstate]) => {
        this.newSubmissionRequest = !isCorrection && !isWithdraw && !isReinstate;
        return this.newSubmissionRequest;
      })
    );
  }

  isCorrectionRequest(): Observable<boolean> {
    if (this.correctionRequest !== null) {
      return of(this.correctionRequest);
    }

    return this.findItemBySubmissionObject().pipe(
      switchMap((item) => this.itemHasRelation(item, 'isCorrectionOfItem')),
      map((hasRelation) => {
        this.correctionRequest = hasRelation;
        return this.correctionRequest;
      })
    );
  }

  isWithdrawRequest(): Observable<boolean> {
    if (this.withdrawRequest !== null) {
      return of(this.withdrawRequest);
    }

    return this.findItemBySubmissionObject().pipe(
      switchMap((item) => this.itemHasRelation(item, 'isWithdrawOfItem')),
      map((hasRelation) => {
        this.withdrawRequest = hasRelation;
        return this.withdrawRequest;
      })
    );
  }

  isReinstateRequest(): Observable<boolean> {
    if (this.reinstateRequest !== null) {
      return of(this.reinstateRequest);
    }

    return this.findItemBySubmissionObject().pipe(
      switchMap((item) => this.itemHasRelation(item, 'isReinstatementOfItem')),
      map((hasRelation) => {
        this.reinstateRequest = hasRelation;
        return this.reinstateRequest;
      })
    );
  }

  findItemBySubmissionObject(): Observable<Item> {
    return this.itemService.findByHref(this.submissionObject._links.item.href).pipe(
      getFirstSucceededRemoteDataPayload()
    );
  }

  itemHasRelation(item: Item, relationship: string): Observable<boolean> {
    return this.relationshipService.getItemRelationshipsByLabel(item, relationship).pipe(
      getFirstSucceededRemoteDataPayload(),
      take(1),
      map((value: PaginatedList<Relationship>) => value.totalElements !== 0 )
    );
  }

}
