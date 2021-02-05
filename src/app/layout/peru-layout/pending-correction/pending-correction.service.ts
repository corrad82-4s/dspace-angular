import { Injectable } from '@angular/core';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { map, switchMap, take } from 'rxjs/operators';
import { Item } from '../../../core/shared/item.model';
import { Metadata } from '../../../core/shared/metadata.utils';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { RelationshipService } from '../../../core/data/relationship.service';
import { Observable } from 'rxjs/internal/Observable';
import { MetadataValue } from '../../../core/shared/metadata.models';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { Collection } from '../../../core/shared/collection.model';
import { followLink } from '../../../shared/utils/follow-link-config.model';
import { Community } from '../../../core/shared/community.model';
import { ItemDataService } from '../../../core/data/item-data.service';
import { CollectionDataService } from '../../../core/data/collection-data.service';

export const CorrectionDenyList = [
  'dc.date.accessioned',
  'dc.date.available',
  'dc.description.provenance'
];

export interface CorrectionItem {
  label: string;
  correctionItem: Item;
  corrections: MetadataCorrection[];
}

export interface MetadataCorrection {
  key: string;
  oldValues: MetadataValue[];
  newValues: MetadataValue[];
  type: 'ADDED' | 'REMOVED' | 'CHANGED';
}

@Injectable({providedIn: 'root'})
export class PendingCorrectionService {

  constructor(protected authorizationService: AuthorizationDataService,
              protected relationshipService: RelationshipService,
              protected itemService: ItemDataService,
              protected collectionService: CollectionDataService) { }

  /**
   * Get the item's correctionItem if present.
   * @param item
   */
  public getCorrectionItem(item: Item): Observable<CorrectionItem> {
    return this.authorizationService.isAuthorized(FeatureID.AdministratorOf).pipe(
      take(1),
      switchMap((isAuthorized) => {
        if (!isAuthorized) {
          return null;
        }
        return this.buildCorrectionItem(item);
      }));
  }



  // ------------
  // Private

  /**
   * Build a data structure which contains the correctionItem, his label (institution item community) and the
   * corrections (metadata differences).
   * @param item
   * @private
   */
  private buildCorrectionItem(item: Item): Observable<CorrectionItem> {
    return this.getIsCorrectionItem(item).pipe(
      switchMap((correctionItem: Item) => {
        return this.getCommunityOfCorrectionItem(correctionItem).pipe(
          map((community: Community) => {
            return {
              label: community.firstMetadataValue('dc.title'),
              corrections: this.getCorrectionMetadata(item, correctionItem),
              correctionItem: correctionItem
            };
          }));
      }));
  }

  /**
   * Traverse all the required relationships in order to retrieve the parent community of the institution item.
   * Directorio Correction Item -> HasShadowCopy (Institution Correction Item) -> IsCorrectedBy (Institution Item).
   * @param correctionItem
   * @private
   */
  private getCommunityOfCorrectionItem(correctionItem): Observable<Community> {
    return this.getHasShadowCopy(correctionItem).pipe(
      switchMap((hasShadowCopy: Item) => this.getIsCorrectedByItem(hasShadowCopy).pipe(
          switchMap((isCorrectedByItem: Item) => this.getOwningCollection(isCorrectedByItem).pipe(
              switchMap((collection: Collection) => this.getParentCommunity(collection))
    )))));
  }

  /**
   * Get the item's correctionItem from existent relationships.
   * @param item
   * @protected
   */
  private getIsCorrectionItem(isCorrectedByItem: Item): Observable<Item> {
    return this.relationshipService.getRelatedItemsByLabel(isCorrectedByItem, 'isCorrectedByItem').pipe(
      getFirstSucceededRemoteDataPayload(),
      map((result: PaginatedList<Item>) => {
        return result.page[0];
      }));
  }

  private getHasShadowCopy(isShadowCopy: Item): Observable<Item> {
    return this.relationshipService.getRelatedItemsByLabel(isShadowCopy, 'isShadowCopy').pipe(
      getFirstSucceededRemoteDataPayload(),
      map((result: PaginatedList<Item>) => {
        return result.page[0];
      }));
  }

  private getIsCorrectedByItem(isCorrectionOfItem: Item): Observable<Item> {
    return this.relationshipService.getRelatedItemsByLabel(isCorrectionOfItem, 'isCorrectionOfItem').pipe(
      getFirstSucceededRemoteDataPayload(),
      map((result: PaginatedList<Item>) => {
        return result.page[0];
      }));
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


  /**
   * Return the different metadata between item and correctionItem.
   * @private
   */
  public getCorrectionMetadata(item: Item, correctionItem: Item): MetadataCorrection[] {

    const corrections: MetadataCorrection[] = [];

    const keys = [...new Set([...Object.keys(item.metadata),...Object.keys(correctionItem.metadata)])];
    keys.forEach((key) => {
      if (CorrectionDenyList.includes(key)) {
        return;
      }
      const keyMetadata = item.allMetadata(key);
      const correctionMetadata = correctionItem.allMetadata(key);
      const correction: MetadataCorrection = { key, oldValues: keyMetadata, newValues: correctionMetadata, type: null };
      if (!Metadata.multiEquals(keyMetadata, correctionMetadata)) {
        // set type of correction
        if (correction.newValues.length === 0) {
          correction.type = 'REMOVED';
        } else if (correction.oldValues.length === 0) {
          correction.type = 'ADDED';
        } else {
          correction.type = 'CHANGED';
        }
        corrections.push(correction);
        return;
      }
    });

    const sorted = [
      ...corrections.filter(c => c.type === 'CHANGED'),
      ...corrections.filter(c => c.type === 'ADDED'),
      ...corrections.filter(c => c.type === 'REMOVED'),
    ];
    return sorted;
  }
}
