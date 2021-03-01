import { Component, ChangeDetectorRef } from '@angular/core';
import { CrisLayoutBox } from '../../../decorators/cris-layout-box.decorator';
import { LayoutPage } from '../../../enums/layout-page.enum';
import { LayoutTab } from '../../../enums/layout-tab.enum';
import { LayoutBox } from '../../../enums/layout-box.enum';
import { CrisLayoutSearchBoxComponent } from '../../../default-layout/boxes/search/cris-layout-search-box.component';

@Component({
  selector: 'ds-peru-search-box',
  templateUrl: '../../../default-layout/boxes/search/cris-layout-search-box.component.html',
  styleUrls: ['../../../default-layout/boxes/search/cris-layout-search-box.component.scss']
})
@CrisLayoutBox(LayoutPage.DEFAULT_PERU, LayoutTab.DEFAULT_PERU, LayoutBox.RELATION)
export class PeruSearchBoxComponent extends CrisLayoutSearchBoxComponent {

  constructor(public cd: ChangeDetectorRef) {
    super(cd);
  }

}
