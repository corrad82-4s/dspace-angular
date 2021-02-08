import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../core/shared/item.model';
import { take } from 'rxjs/operators';
import { CorrectionItem, PendingCorrectionService } from './pending-correction.service';

@Component({
  selector: 'ds-pending-correction',
  templateUrl: './pending-correction.component.html',
  styleUrls: ['./pending-correction.component.scss']
})
export class PendingCorrectionComponent implements OnInit {

  @Input() item: Item;

  correctionItem: CorrectionItem;

  hide = true;

  constructor(protected pendingCorrectionService: PendingCorrectionService, protected _cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (this.item) {
      this.pendingCorrectionService.getCorrectionItem(this.item).pipe(take(1)).subscribe((correctionItem: CorrectionItem) => {
        this.correctionItem = correctionItem;
        this._cd.detectChanges();
      });
    }
  }

  toggleHide() {
    this.hide = !this.hide;
  }

}
