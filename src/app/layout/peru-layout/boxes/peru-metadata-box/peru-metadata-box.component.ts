import { ChangeDetectorRef, Component, ComponentRef, Input, Output, EventEmitter } from '@angular/core';
import { CrisLayoutMetadataBoxComponent } from '../../../default-layout/boxes/metadata/cris-layout-metadata-box.component';
import { MetadataComponentsDataService } from '../../../../core/layout/metadata-components-data.service';
import { CrisLayoutBox } from '../../../decorators/cris-layout-box.decorator';
import { LayoutPage } from '../../../enums/layout-page.enum';
import { LayoutTab } from '../../../enums/layout-tab.enum';
import { LayoutBox } from '../../../enums/layout-box.enum';
import { LayoutField, MetadataComponent, Row } from '../../../../core/layout/models/metadata-component.model';
import { Item } from '../../../../core/shared/item.model';
import { Metadata } from '../../../../core/shared/metadata.utils';

@Component({
  selector: 'ds-peru-metadata-box',
  templateUrl: '../../../default-layout/boxes/metadata/cris-layout-metadata-box.component.html',
  styleUrls: ['../../../default-layout/boxes/metadata/cris-layout-metadata-box.component.scss']
})
@CrisLayoutBox(LayoutPage.DEFAULT_PERU, LayoutTab.DEFAULT_PERU, LayoutBox.METADATA)
export class PeruMetadataBoxComponent extends CrisLayoutMetadataBoxComponent {

  @Input() shadowCopy: Item;

  constructor(public cd: ChangeDetectorRef,
              protected metadatacomponentsService: MetadataComponentsDataService) {
    super(cd, metadatacomponentsService);
  }

  /**
   * When a shadowCopy is present, we can add custom styles patching metadatacomponents.
   * @param metadatacomponents
   */
  setMetadataComponents(metadatacomponents: MetadataComponent) {

    if (!this.shadowCopy) {
      this.metadatacomponents = metadatacomponents;
      return;
    }
    this.metadatacomponents = patchedMetadataComponent(metadatacomponents, this.item, this.shadowCopy);
  }

  populateComponent(metadataRef: ComponentRef<Component>, field, subtype) {

    (metadataRef.instance as any).item = this.item;
    (metadataRef.instance as any).field = field;
    (metadataRef.instance as any).subtype = subtype;
  }

}

/**
 * Clone the immutable metadatacomponents with extra data given a shadowCopy.
 * @param metadatacomponents
 * @param item
 * @param shadowCopy
 */
function patchedMetadataComponent(metadatacomponents, item: Item, shadowCopy: Item): MetadataComponent {

  // records if at least one metadata value match with the shadowCopy.
  let shadowedContentPresent = false;

  const cloned = {...metadatacomponents};

  cloned.rows = metadatacomponents.rows.map((row: Row) => {
    const clonedRow = {...row};
    clonedRow.fields = row.fields.map((field: LayoutField) => {
      const clonedField = {...field};
      if (field.bitstream) {
        clonedField.bitstream = {...field.bitstream};
      }

      if (clonedField.metadata) {
        const itemValues = item.allMetadata(clonedField.metadata);
        const shadowValues = shadowCopy.allMetadata(clonedField.metadata);
        const equals = Metadata.multiEquals(itemValues, shadowValues);
        if (!equals) {
          clonedField.styleValue = clonedField.styleValue + ' not-shadowed-metadata';
        } else {
          shadowedContentPresent = true;
        }
      }
      return clonedField;
    });
    return clonedRow;
  });
  return cloned;
}


