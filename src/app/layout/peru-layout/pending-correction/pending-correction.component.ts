import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../core/shared/item.model';
import { Metadata } from '../../../core/shared/metadata.utils';
import { MetadataValue } from '../../../core/shared/metadata.models';
import { RelationshipService } from '../../../core/data/relationship.service';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { take } from 'rxjs/operators';

export interface MetadataCorrection {
  key: string;
  oldValues: MetadataValue[];
  newValues: MetadataValue[];
  type: 'ADDED' | 'REMOVED' | 'CHANGED';
}

@Component({
  selector: 'ds-pending-correction',
  templateUrl: './pending-correction.component.html',
  styleUrls: ['./pending-correction.component.scss']
})
export class PendingCorrectionComponent implements OnInit {

  @Input() item: Item;

  correctionItem: Item;

  corrections: MetadataCorrection[];

  hide = true;

  constructor(protected authorizationService: AuthorizationDataService, protected relationshipService: RelationshipService) { }

  ngOnInit(): void {
    this.authorizationService.isAuthorized(FeatureID.AdministratorOf).pipe(take(1)).subscribe((isAuthorized) => {
      if (!isAuthorized) {
        return;
      }
      this.relationshipService.getCorrectionItem(this.item).subscribe((item) => {
        this.correctionItem = item;
        this.corrections = this.getCorrectionMetadata(this.item, this.correctionItem);
      });
    });
  }

  toggleHide() {
    this.hide = !this.hide;
  }

  /**
   * Return the different metadata between item and correctionItem.
   * @private
   */
  private getCorrectionMetadata(item: Item, correctionItem: Item): MetadataCorrection[] {

    const corrections: MetadataCorrection[] = [];

    const keys = [...new Set([...Object.keys(item.metadata),...Object.keys(correctionItem.metadata)])];
    keys.forEach((key) => {
      const keyMetadata = this.item.allMetadata(key);
      const correctionMetadata = correctionItem.allMetadata(key);
      const correction: MetadataCorrection = { key, oldValues: keyMetadata, newValues: correctionMetadata, type: null };
      if (Metadata.multiEquals(keyMetadata, correctionMetadata)) {
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
