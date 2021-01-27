import { Component, Input } from '@angular/core';
import { Item } from '../../../../core/shared/item.model';
import { MetadataCorrection } from '../pending-correction.component';

@Component({
  selector: 'ds-pending-correction-details',
  templateUrl: './pending-correction-details.component.html',
  styleUrls: ['./pending-correction-details.component.scss']
})
export class PendingCorrectionDetailsComponent {

  @Input() item: Item;

  @Input() correctionItem: Item;

  @Input() corrections: MetadataCorrection[];

}
