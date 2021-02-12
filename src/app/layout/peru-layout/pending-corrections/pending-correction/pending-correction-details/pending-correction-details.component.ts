import { Component, Input } from '@angular/core';
import { Item } from '../../../../../core/shared/item.model';
import { MetadataCorrection } from '../../../services/pending-correction.service';

@Component({
  selector: 'ds-pending-correction-details',
  templateUrl: './pending-correction-details.component.html',
  styleUrls: ['./pending-correction-details.component.scss']
})
export class PendingCorrectionDetailsComponent {

  @Input() correctionItem: Item;

  @Input() corrections: MetadataCorrection[];

}
