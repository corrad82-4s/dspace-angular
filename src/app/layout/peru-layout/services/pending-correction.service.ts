import { Injectable } from '@angular/core';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { map, switchMap, take } from 'rxjs/operators';
import { Item } from '../../../core/shared/item.model';
import { Metadata } from '../../../core/shared/metadata.utils';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { Observable } from 'rxjs/internal/Observable';
import { MetadataValue } from '../../../core/shared/metadata.models';
import { SourcesCorrectionsUtilsService } from './sources-corrections-utils.service';
import { forkJoin } from 'rxjs';

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
              protected sourcesCorrectionsUtilsService: SourcesCorrectionsUtilsService) { }

  /**
   * Get the item's correctionItem if present.
   * @param item
   */
  public getCorrectionItems(item: Item): Observable<CorrectionItem[]> {
    return this.authorizationService.isAuthorized(FeatureID.AdministratorOf).pipe(take(1),
      switchMap((isAuthorized) => {
        if (!isAuthorized) {
          return [];
        }
        return this.getItemsCorrectionItems(item).pipe(
          switchMap((correctionItems: Item[]) => this.buildCorrectionItems(item, correctionItems)),
        );
      }));
  }



  // ------------
  // Private

  private getItemsCorrectionItems(item: Item): Observable<Item[]> {
    return this.sourcesCorrectionsUtilsService.getRelatedItems(item, 'isCorrectedByItem');
  }

  /**
   * For each correctionItem build the structure with a label and the differences.
   * @param item
   * @param correctionItems
   * @protected
   */
  private buildCorrectionItems(item: Item, correctionItems: Item[]): Observable<CorrectionItem[]> {
    return forkJoin(correctionItems.map((correctionItem) => this.buildCorrectionItem(item, correctionItem)));
  }

  /**
   * Build a data structure which contains the correctionItem, his label (institution item community) and the
   * corrections (metadata differences).
   * @param item
   * @private
   */
  private buildCorrectionItem(item: Item, correctionItem: Item): Observable<CorrectionItem> {
    return this.getCorrectionItemLabel(correctionItem).pipe(
      map((label: string) => ({
        label: label ? label : correctionItem.uuid,
        corrections: this.getCorrectionMetadata(item, correctionItem),
        correctionItem: correctionItem
      }))
    );
  }

  /**
   * Traverse the required relationship and then, fetch the label.
   * @param correctionItem
   * @private
   */
  private getCorrectionItemLabel(correctionItem): Observable<string> {
    return this.sourcesCorrectionsUtilsService.getRelatedItem(correctionItem, 'isShadowCopy').pipe(
      switchMap((hasShadowCopy: Item) => {
        return this.sourcesCorrectionsUtilsService.getRelatedItem(hasShadowCopy, 'isCorrectionOfItem').pipe(
          switchMap((isCorrectedByItem: Item) => {
            return this.sourcesCorrectionsUtilsService.getItemLabel(isCorrectedByItem);
        }));
    }));
  }


  /**
   * Return the different metadata between item and correctionItem.
   * @private
   */
  private getCorrectionMetadata(item: Item, correctionItem: Item): MetadataCorrection[] {

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
