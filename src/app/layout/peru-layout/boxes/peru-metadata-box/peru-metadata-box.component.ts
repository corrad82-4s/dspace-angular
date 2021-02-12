import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CrisLayoutMetadataBoxComponent } from '../../../default-layout/boxes/metadata/cris-layout-metadata-box.component';
import { MetadataComponentsDataService } from '../../../../core/layout/metadata-components-data.service';
import { CrisLayoutBox } from '../../../decorators/cris-layout-box.decorator';
import { LayoutPage } from '../../../enums/layout-page.enum';
import { LayoutTab } from '../../../enums/layout-tab.enum';
import { LayoutBox } from '../../../enums/layout-box.enum';
import { MetadataComponent } from '../../../../core/layout/models/metadata-component.model';
import { Item } from '../../../../core/shared/item.model';
import { PeruMetadataBoxService } from './peru-metadata-box.service';

@Component({
  selector: 'ds-peru-metadata-box',
  templateUrl: '../../../default-layout/boxes/metadata/cris-layout-metadata-box.component.html',
  styleUrls: ['../../../default-layout/boxes/metadata/cris-layout-metadata-box.component.scss']
})
@CrisLayoutBox(LayoutPage.DEFAULT_PERU, LayoutTab.DEFAULT_PERU, LayoutBox.METADATA)
export class PeruMetadataBoxComponent extends CrisLayoutMetadataBoxComponent {

  @Input() sourceItem: Item;

  constructor(public cd: ChangeDetectorRef,
              protected metadatacomponentsService: MetadataComponentsDataService,
              protected peruMetadataBoxService: PeruMetadataBoxService) {
    super(cd, metadatacomponentsService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  /**
   * When a sourceItem is present, we can add custom styles patching metadatacomponents.
   * @param metadatacomponents
   */
  setMetadataComponents(metadatacomponents: MetadataComponent) {

    if (!this.sourceItem) {
      this.metadatacomponents = metadatacomponents;
      return;
    }
    this.metadatacomponents = this.peruMetadataBoxService
      .patchedMetadataComponent(metadatacomponents, this.item, this.sourceItem);
  }


}




