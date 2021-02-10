import { Injectable } from '@angular/core';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { Item } from '../../../core/shared/item.model';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { RelationshipService } from '../../../core/data/relationship.service';
import { Observable } from 'rxjs/internal/Observable';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { of } from 'rxjs/internal/observable/of';
import { combineLatest, forkJoin } from 'rxjs';
import { hasValue } from '../../../shared/empty.util';
import { ItemDataService } from '../../../core/data/item-data.service';
import { followLink } from '../../../shared/utils/follow-link-config.model';
import { Collection } from '../../../core/shared/collection.model';
import { Community } from '../../../core/shared/community.model';
import { CollectionDataService } from '../../../core/data/collection-data.service';

/**
 * The label of the source of information is:
 *  - the name of the parentCommunity of the source of information's owningCollection.
 *  - the sourceItem.uuid when the owning collection is not available.
 */
export interface SourceOfInformation {
  kind: 'root' | 'isShadowCopy' | 'isOriginatedFrom';
  sourceItem: Item;
  label: string;
}

@Injectable({providedIn: 'root'})
export class SourcesOfInformationService {

  constructor(protected authorizationService: AuthorizationDataService,
              protected relationshipService: RelationshipService,
              protected itemService: ItemDataService,
              protected collectionService: CollectionDataService) { }

  /**
   * Get the item's sources of information, with labels.
   * @param item
   */
  public getSourcesOfInformation(item: Item): Observable<SourceOfInformation[]> {

    return combineLatest([
        of({ kind: 'root', sourceItem: item, label: item.uuid } as SourceOfInformation),
        this.getSourcesOfInformationItems(item, 'isShadowCopy'),
        this.getSourcesOfInformationItems(item, 'isOriginatedFrom')
    ]).pipe(
        switchMap(([rootSource, shadowCopies, originatedFrom]) => this.getSourcesOfInformationWithLabels(
          [ rootSource, ...shadowCopies, ...originatedFrom ])),
        filter((sourcesOfInformation: SourceOfInformation[]) => hasValue(sourcesOfInformation))
      );
  }

  // ------------
  // Private

  /**
   * Get the sources of information items from a relevant relationship.
   * @param item
   * @protected
   */
  protected getSourcesOfInformationItems(item: Item, relation: 'isShadowCopy' | 'isOriginatedFrom'): Observable<SourceOfInformation[]> {
    return this.relationshipService.getRelatedItemsByLabel(item, relation).pipe(
      getFirstSucceededRemoteDataPayload(),
      map((result: PaginatedList<Item>) => {
        return result.page.map((sourceItem: Item) => ({ kind: relation, sourceItem, label: sourceItem.uuid}));
      }));
  }

  /**
   * For each sourceOfInformation enrich with a label.
   * @param sourcesOfInformation
   * @protected
   */
  protected getSourcesOfInformationWithLabels(sourcesOfInformation: SourceOfInformation[]): Observable<SourceOfInformation[]> {
    return forkJoin(sourcesOfInformation.map((sourceOfInformation) => this.getSourceOfInformationWithLabel(sourceOfInformation)));
  }

  /**
   * Get the label of the sourceOfInformation following this path:
   * sourceOfInformation -> owningCollection -> parentCommunity (dc.title)
   * In case of error the label is the sourceOfInformation uuid.
   * @param sourceOfInformation
   * @protected
   */
  protected getSourceOfInformationWithLabel(sourceOfInformation: SourceOfInformation): Observable<SourceOfInformation> {

    return this.getOwningCollection(sourceOfInformation.sourceItem)
      .pipe(
        switchMap((owningCollection: Collection) => {
          return this.getParentCommunity(owningCollection).pipe(
            map((parentCommunity: Community) => {
              return { ...sourceOfInformation, label: parentCommunity.firstMetadataValue('dc.title') };
            }),
            catchError((error) => of(sourceOfInformation))
          );
        }),
        catchError((error) => of(sourceOfInformation))
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
