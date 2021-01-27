import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Item } from '../../../core/shared/item.model';
import { RelationshipService } from '../../../core/data/relationship.service';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { take } from 'rxjs/operators';


@Component({
  selector: 'ds-shadow-copies',
  templateUrl: './shadow-copies.component.html',
  styleUrls: ['./shadow-copies.component.scss']
})
export class ShadowCopiesComponent implements OnInit {

  @Input() item: Item;

  @Output() selectShadowCopy = new EventEmitter<Item>();

  shadowCopies: Item[];

  selectedShadowCopy: Item;

  constructor(protected authorizationService: AuthorizationDataService, protected relationshipService: RelationshipService) { }

  /**
   * If the user is authorized fetch the related shadow copies.
   */
  ngOnInit(): void {
    this.authorizationService.isAuthorized(FeatureID.AdministratorOf).pipe(take(1)).subscribe((isAuthorized) => {
      if (!isAuthorized) {
        return;
      }
      this.relationshipService.getShadowCopies(this.item).subscribe((items) => {
        this.shadowCopies = items;
      });
    });
  }

  /**
   * Keep track of the selected shadow copy and emit the new value.
   * @param shadowCopy
   */
  onSelectShadowCopy(shadowCopy: Item) {
    if (this.selectedShadowCopy === shadowCopy) {
      // deselect
      this.selectedShadowCopy = null;
    } else {
      // new selection
      this.selectedShadowCopy = shadowCopy;
    }
    // emit
    this.selectShadowCopy.emit(this.selectedShadowCopy);
  }

}
