import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { Item } from '../../../core/shared/item.model';
import { take } from 'rxjs/operators';
import { SourceOfInformation, SourcesOfInformationService } from './sources-of-information.service';


@Component({
  selector: 'ds-sources-of-information',
  templateUrl: './sources-of-information.component.html',
  styleUrls: ['./sources-of-information.component.scss']
})
export class SourcesOfInformationComponent implements OnInit {

  @Input() item: Item;

  @Output() selectSourceItem = new EventEmitter<Item>();

  sourcesOfInformation: SourceOfInformation[];

  selectedSource: Item;

  constructor(protected sourcesOfInformationService: SourcesOfInformationService, protected _cd: ChangeDetectorRef) { }

  /**
   * If the user is authorized fetch the related shadow copies.
   */
  ngOnInit(): void {
    if (this.item) {
      this.sourcesOfInformationService.getSourcesOfInformation(this.item).pipe(take(1)).subscribe((sourcesOfInformation: SourceOfInformation[]) => {
        this.selectedSource = sourcesOfInformation[0].sourceItem;
        this.sourcesOfInformation = sourcesOfInformation;
        this._cd.detectChanges();
      });
    }
  }

  /**
   * Keep track of the selected source item and emit the new value.
   * @param sourceItem
   */
  onSelectSourceItem(sourceItem: Item) {
    this.selectedSource = sourceItem;
    this.selectSourceItem.emit(this.selectedSource);
  }

}
