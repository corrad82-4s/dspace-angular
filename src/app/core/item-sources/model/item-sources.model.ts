import { CacheableObject } from '../../cache/object-cache.reducer';
import { HALLink } from '../../shared/hal-link.model';
import { autoserialize, deserialize } from 'cerialize';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';
import { typedObject } from '../../cache/builders/build-decorators';
import { ITEM_SOURCES } from './item-sources.resource-type';

export interface ItemSource {
  itemUuid: string;
  relationshipType: string;
  source: string;
  metadata: string[];
}

/**
 * Object representing an ItemSource.
 */
@typedObject
export class ItemSources implements CacheableObject {
  static type = ITEM_SOURCES;

  /**
   * The object type
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * The identifier for this item
   */
  @autoserialize
  id: string;

  /**
   * The sources list for this item
   */
  @autoserialize
  sources: ItemSource[];

  /**
   * The {@link HALLink}s for this ItemSource
   */
  @deserialize
  _links: {
    self: HALLink;
  };

}
