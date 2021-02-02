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

export interface MetadataCorrection {
  key: string;
  oldValues: MetadataValue[];
  newValues: MetadataValue[];
  type: 'ADDED' | 'REMOVED' | 'CHANGED';
}

@Injectable({providedIn: 'root'})
export class PendingCorrectionService {

  constructor(protected authorizationService: AuthorizationDataService, protected relationshipService: RelationshipService) { }

  /**
   * Get the item's correctionItem if present.
   * @param item
   */
  public getCorrectionItem(item: Item): Observable<Item> {
    return this.authorizationService.isAuthorized(FeatureID.AdministratorOf).pipe(
      take(1),
      switchMap((isAuthorized) => {
        if (!isAuthorized) {
          return null;
        }
        return this.getCorrectionItemFromRelations(item);
      })
    );
  }

  /**
   * Return the different metadata between item and correctionItem.
   * @private
   */
  public getCorrectionMetadata(item: Item, correctionItem: Item): MetadataCorrection[] {

    const corrections: MetadataCorrection[] = [];

    const keys = [...new Set([...Object.keys(item.metadata),...Object.keys(correctionItem.metadata)])];
    keys.forEach((key) => {
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

  // ------------
  // Private

  /**
   * Get the item's correctionItem from existent relationships.
   * @param item
   * @protected
   */
  private getCorrectionItemFromRelations(item: Item): Observable<Item> {
    return this.relationshipService.getRelatedItemsByLabel(item, 'isCorrectedByItem').pipe(
      getFirstSucceededRemoteDataPayload(),
      map((result: PaginatedList<Item>) => {
        return result.page[0];
      }));
  }

}
