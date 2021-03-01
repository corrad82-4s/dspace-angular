import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { Item } from '../../../core/shared/item.model';
import { take } from 'rxjs/operators';
import { SourcesOfInformationService } from '../services/sources-of-information.service';
import { ItemSource } from '../../../core/item-sources/model/item-sources.model';
import { combineLatest } from 'rxjs';


@Component({
  selector: 'ds-sources-of-information',
  templateUrl: './sources-of-information.component.html',
  styleUrls: ['./sources-of-information.component.scss']
})
export class SourcesOfInformationComponent implements OnInit {

  @Input() item: Item;

  @Output() selectItemSource = new EventEmitter<ItemSource>();

  itemLabel: string;

  itemSources: ItemSource[];

  selectedSource: ItemSource = null;

  constructor(protected sourcesOfInformationService: SourcesOfInformationService, protected _cd: ChangeDetectorRef) { }

  /**
   * If the user is authorized fetch the related shadow copies.
   */
  ngOnInit(): void {
    if (this.item) {

      combineLatest([
        this.sourcesOfInformationService.getItemSources(this.item.uuid),
        this.sourcesOfInformationService.getItemLabel(this.item)]).pipe(take(1)).subscribe(([itemSources, label]) => {
          debugger;
          this.itemSources = itemSources.sources;
          this.itemLabel = label;
      });

    }
  }

  /**
   * Keep track of the selected item source and emit the new value.
   * @param itemSource
   */
  onSelectSourceItem(itemSource: ItemSource) {
    this.selectedSource = itemSource;
    this.selectItemSource.emit(this.selectedSource);
  }

}
