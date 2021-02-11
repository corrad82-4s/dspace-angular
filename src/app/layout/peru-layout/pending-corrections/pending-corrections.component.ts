import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { Item } from '../../../core/shared/item.model';
import { CorrectionItem, PendingCorrectionService } from '../services/pending-correction.service';

@Component({
  selector: 'ds-pending-corrections',
  templateUrl: './pending-corrections.component.html',
  styleUrls: ['./pending-corrections.component.scss']
})
export class PendingCorrectionsComponent implements OnInit {

  @Input() item: Item;

  correctionItems: CorrectionItem[] = [];

  constructor(protected pendingCorrectionService: PendingCorrectionService, protected _cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (this.item) {
      this.pendingCorrectionService.getCorrectionItems(this.item).pipe(take(1)).subscribe((correctionItems: CorrectionItem[]) => {
        this.correctionItems = correctionItems;
        this._cd.detectChanges();
      });
    }
  }

}
