import { Component } from '@angular/core';
import { listableObjectComponent } from '../../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { ViewMode } from '../../../../../core/shared/view-mode.model';
import { focusShadow } from '../../../../../shared/animations/focus';
import { SearchResultGridElementComponent } from '../../../../../shared/object-grid/search-result-grid-element/search-result-grid-element.component';
import { ItemSearchResult } from '../../../../../shared/object-collection/shared/item-search-result.model';
import { Item } from '../../../../../core/shared/item.model';
import { isNotEmpty } from '../../../../../shared/empty.util';

@listableObjectComponent('PersonSearchResult', ViewMode.GridElement)
@Component({
  selector: 'ds-person-search-result-grid-element',
  styleUrls: ['./person-search-result-grid-element.component.scss'],
  templateUrl: './person-search-result-grid-element.component.html',
  animations: [focusShadow]
})
/**
 * The component for displaying a grid element for an item search result of the type Person
 */
export class PersonSearchResultGridElementComponent extends SearchResultGridElementComponent<ItemSearchResult, Item> {

  getPersonName(): string {
    let personName = this.dso.name;
    if (isNotEmpty(this.firstMetadataValue('person.familyName')) && isNotEmpty(this.firstMetadataValue('person.givenName'))) {
      personName = this.firstMetadataValue('person.familyName') + ', ' + this.firstMetadataValue('person.givenName');
    }

    return personName;
  }
}
