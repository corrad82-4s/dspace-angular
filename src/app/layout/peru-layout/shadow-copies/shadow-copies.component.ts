import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { Item } from '../../../core/shared/item.model';
import { take } from 'rxjs/operators';
import { ShadowCopiesService, ShadowCopy } from './shadow-copies.service';


@Component({
  selector: 'ds-shadow-copies',
  templateUrl: './shadow-copies.component.html',
  styleUrls: ['./shadow-copies.component.scss']
})
export class ShadowCopiesComponent implements OnInit {

  @Input() item: Item;

  @Output() selectShadowCopy = new EventEmitter<Item>();

  shadowCopies: ShadowCopy[];

  selectedShadowCopy: Item;

  constructor(protected shadowCopiesService: ShadowCopiesService, protected _cd: ChangeDetectorRef) { }

  /**
   * If the user is authorized fetch the related shadow copies.
   */
  ngOnInit(): void {
    this.shadowCopiesService.getShadowCopies(this.item).pipe(take(1)).subscribe((shadowCopies: ShadowCopy[]) => {
      this.selectedShadowCopy = shadowCopies[0].shadowCopy;
      this.shadowCopies = shadowCopies;
      this._cd.detectChanges();
    });
  }

  /**
   * Keep track of the selected shadow copy and emit the new value.
   * @param shadowCopy
   */
  onSelectShadowCopy(shadowCopy: Item) {
    this.selectedShadowCopy = shadowCopy;
    this.selectShadowCopy.emit(this.selectedShadowCopy);
  }

}
