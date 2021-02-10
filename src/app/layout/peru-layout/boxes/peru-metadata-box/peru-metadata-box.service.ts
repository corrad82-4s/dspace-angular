import { Injectable } from '@angular/core';
import { Item } from '../../../../core/shared/item.model';
import { LayoutField, MetadataComponent, Row } from '../../../../core/layout/models/metadata-component.model';
import { Metadata } from '../../../../core/shared/metadata.utils';

@Injectable({providedIn: 'root'})
export class PeruMetadataBoxService {

  /**
   * Clone the immutable metadatacomponents with extra data given a sourceItem.
   * @param metadatacomponents
   * @param item
   * @param sourceItem
   */
  public patchedMetadataComponent(metadatacomponents: MetadataComponent, item: Item, sourceItem: Item): MetadataComponent {

    // records if at least one metadata value match with the sourceItem.
    let sourceContentPresent = false;

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
          const sourceValues = sourceItem.allMetadata(clonedField.metadata);
          const equals = Metadata.multiEquals(itemValues, sourceValues);
          if (!equals) {
            clonedField.styleValue = clonedField.styleValue + ' not-shadowed-metadata';
          } else {
            sourceContentPresent = true;
          }
        }
        return clonedField;
      });
      return clonedRow;
    });
    return cloned;
  }

}




