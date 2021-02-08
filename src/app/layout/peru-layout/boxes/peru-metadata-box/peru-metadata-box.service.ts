import { Injectable } from '@angular/core';
import { Item } from '../../../../core/shared/item.model';
import { LayoutField, MetadataComponent, Row } from '../../../../core/layout/models/metadata-component.model';
import { Metadata } from '../../../../core/shared/metadata.utils';

@Injectable({providedIn: 'root'})
export class PeruMetadataBoxService {

  /**
   * Clone the immutable metadatacomponents with extra data given a shadowCopy.
   * @param metadatacomponents
   * @param item
   * @param shadowCopy
   */
  public patchedMetadataComponent(metadatacomponents: MetadataComponent, item: Item, shadowCopy: Item): MetadataComponent {

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

}




