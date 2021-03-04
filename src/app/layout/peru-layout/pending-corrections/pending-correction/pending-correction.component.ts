import { Component, Input } from '@angular/core';
import { CorrectionItem } from '../../services/pending-correction.service';

@Component({
  selector: 'ds-pending-correction',
  templateUrl: './pending-correction.component.html',
  styleUrls: ['./pending-correction.component.scss']
})
export class PendingCorrectionComponent {

  @Input() correctionItem: CorrectionItem;

  hide = true;

  toggleHide() {
    this.hide = !this.hide;
  }

}
