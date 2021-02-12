import { Injectable } from '@angular/core';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Item } from '../../../core/shared/item.model';
import { Observable } from 'rxjs/internal/Observable';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { Collection } from '../../../core/shared/collection.model';
import { followLink } from '../../../shared/utils/follow-link-config.model';
import { Community } from '../../../core/shared/community.model';
import { ItemDataService } from '../../../core/data/item-data.service';
import { CollectionDataService } from '../../../core/data/collection-data.service';
import { of } from 'rxjs/internal/observable/of';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { RelationshipService } from '../../../core/data/relationship.service';

@Injectable({providedIn: 'root'})
export class SourcesCorrectionsUtilsService {

  constructor(protected relationshipService: RelationshipService,
              protected itemService: ItemDataService,
              protected collectionService: CollectionDataService) { }


  /**
   * Get the label of the item following this path:
   * item -> owningCollection -> parentCommunity (dc.title)
   * @param item
   * @protected
   */
  public getItemLabel(item: Item): Observable<string> {
    return this.getOwningCollection(item)
      .pipe(
        switchMap((owningCollection: Collection) => {
          return this.getParentCommunity(owningCollection).pipe(
            map((parentCommunity: Community) => {
              return parentCommunity.firstMetadataValue('dc.title');
            }),
            catchError((error) => of(null))
          );
        }),
        catchError((error) => of(null))
      );
  }

  public getRelatedItems(item: Item, relation: 'isCorrectedByItem'): Observable<Item[]> {
    return this.relationshipService.getRelatedItemsByLabel(item, relation).pipe(
      getFirstSucceededRemoteDataPayload(),
      map((result: PaginatedList<Item>) => {
        return result.page;
      }));
  }

  public getRelatedItem(item: Item, relation: 'isCorrectedByItem' | 'isShadowCopy' | 'isCorrectionOfItem'): Observable<Item> {
    return this.relationshipService.getRelatedItemsByLabel(item, relation).pipe(
      getFirstSucceededRemoteDataPayload(),
      map((result: PaginatedList<Item>) => {
        return result.page[0];
      }),
      catchError((error) => of(null)));
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
