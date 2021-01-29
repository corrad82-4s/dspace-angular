import { Injectable } from '@angular/core';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { Item } from '../../../core/shared/item.model';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { RelationshipService } from '../../../core/data/relationship.service';
import { Observable } from 'rxjs/internal/Observable';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { of } from 'rxjs/internal/observable/of';
import { forkJoin } from 'rxjs';
import { hasValue } from '../../../shared/empty.util';
import { ItemDataService } from '../../../core/data/item-data.service';
import { followLink } from '../../../shared/utils/follow-link-config.model';
import { Collection } from '../../../core/shared/collection.model';
import { Community } from '../../../core/shared/community.model';
import { CollectionDataService } from '../../../core/data/collection-data.service';

/**
 * The label of the shadowCopy is the name of the parentCommunity of the shadowCopy's owningCollection.
 */
export interface ShadowCopy {
  shadowCopy: Item;
  label: string;
}

@Injectable({providedIn: 'root'})
export class ShadowCopiesService {

  constructor(protected authorizationService: AuthorizationDataService,
              protected relationshipService: RelationshipService,
              protected itemService: ItemDataService,
              protected collectionService: CollectionDataService) { }

  /**
   * Get the item's shadow copies.
   * @param item
   */
  public getShadowCopies(item: Item): Observable<ShadowCopy[]> {

    return this.getShadowCopyItems(item).pipe(
        switchMap((shadowCopies: Item[]) => this.getShadowCopiesWithLabels([item, ...shadowCopies])),
        filter((shadowCopies: ShadowCopy[]) => hasValue(shadowCopies))
      );
  }

  // ------------
  // Private

  /**
   * Get the item's shadow copies from existent relationships.
   * @param item
   * @protected
   */
  protected getShadowCopyItems(item: Item): Observable<Item[]> {
    return this.relationshipService.getRelatedItemsByLabel(item, 'isShadowCopy').pipe(
      getFirstSucceededRemoteDataPayload(),
      map((result: PaginatedList<Item>) => {
        return result.page;
      }));
  }

  /**
   * For each shadowCopy enrich the shadowCopy with a label.
   * @param shadowCopies
   * @protected
   */
  protected getShadowCopiesWithLabels(shadowCopies: Item[]): Observable<ShadowCopy[]> {
    return forkJoin(shadowCopies.map((shadowCopy) => this.getShadowCopyWithLabel(shadowCopy)));
  }

  /**
   * Get the label of the shadowCopy following this path:
   * shadowCopy -> owningCollection -> parentCommunity (dc.title)
   * In case of error the label is the shadowCopy uuid.
   * @param shadowCopy
   * @protected
   */
  protected getShadowCopyWithLabel(shadowCopy: Item): Observable<ShadowCopy> {

    return this.getOwningCollection(shadowCopy)
      .pipe(
        switchMap((owningCollection: Collection) => {
          return this.getParentCommunity(owningCollection).pipe(
            map((parentCommunity: Community) => {
              return { shadowCopy, label: parentCommunity.firstMetadataValue('dc.title') };
            }),
            catchError((error) => of({ shadowCopy, label: shadowCopy.uuid }))
          );
        }),
        catchError((error) => of({ shadowCopy, label: shadowCopy.uuid }))
    );
  }

  /**
   * Get the item's owningCollection.
   * @param item
   * @protected
   */
  protected getOwningCollection(item: Item): Observable<Collection> {
    return this.itemService.findById(item.uuid, true, followLink('owningCollection'))
      .pipe(
        getFirstSucceededRemoteDataPayload(),
        switchMap((fullItem: Item) => {
        return fullItem.owningCollection.pipe(
          getFirstSucceededRemoteDataPayload());
      }));
  }

  /**
   * Get the collection's parentCommunity.
   * @param collection
   * @protected
   */
  protected getParentCommunity(collection: Collection): Observable<Community> {
    return this.collectionService.findById(collection.uuid, true, followLink('parentCommunity'))
      .pipe(
        getFirstSucceededRemoteDataPayload(),
        switchMap((fullCollection: Collection) => {
          return fullCollection.parentCommunity.pipe(
            getFirstSucceededRemoteDataPayload());
      }));
  }

}
