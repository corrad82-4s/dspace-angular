import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../core/shared/item.model';
import { take } from 'rxjs/operators';
import { MetadataCorrection, PendingCorrectionService } from './pending-correction.service';

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

  constructor(protected pendingCorrectionService: PendingCorrectionService) { }

  ngOnInit(): void {

    this.pendingCorrectionService.getCorrectionItem(this.item).pipe(take(1)).subscribe((correctionItem) => {
      this.correctionItem = correctionItem;
      this.corrections = this.pendingCorrectionService.getCorrectionMetadata(this.item, this.correctionItem);
    });
  }

  toggleHide() {
    this.hide = !this.hide;
  }

}
