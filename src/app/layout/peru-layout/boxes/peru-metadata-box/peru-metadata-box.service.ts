import { Injectable } from '@angular/core';
import { Item } from '../../../../core/shared/item.model';
import { LayoutField, MetadataComponent, Row } from '../../../../core/layout/models/metadata-component.model';
import { ItemSource } from '../../../../core/item-sources/model/item-sources.model';

@Injectable({providedIn: 'root'})
export class PeruMetadataBoxService {

  /**
   * Clone the immutable metadatacomponents with extra information computed inspecting an sourceItem.
   * In particular:
   * - add to each LayoutField the class 'not-source-metadata' in case its metadata doesn't have any matching in the sourceItem.
   * @param metadatacomponents
   * @param item
   * @param sourceItem
   */
  public patchedMetadataComponent(metadatacomponents: MetadataComponent, item: Item, itemSource: ItemSource): MetadataComponent {

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
          if (!this.isSourceCheck(itemSource.metadata, clonedField.metadata)) {
            clonedField.styleValue = clonedField.styleValue + ' not-source-metadata';
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

  private isSourceCheck(sourceMetadata: string[], itemMetadata: string): boolean {
    return sourceMetadata.map(metadata => metadata.split('/')[0]).includes(itemMetadata);
  }

}




