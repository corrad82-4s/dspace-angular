import { CacheableObject } from '../../cache/object-cache.reducer';
import { HALLink } from '../../shared/hal-link.model';
import { autoserialize, deserialize } from 'cerialize';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';
import { typedObject } from '../../cache/builders/build-decorators';
import { ITEM_SOURCES } from './item-sources.resource-type';

export class ItemSource {
  itemUuid: string;
  relationshipType: string;
  source: string;
  metadata: string[];
}

/**
 * Object representing an Audit.
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
   * The identifier for this audit
   */
  @autoserialize
  id: string;

  /**
   * The eperson UUID for this audit
   */
  @autoserialize
  sources: ItemSource[];

  /**
   * The {@link HALLink}s for this Audit
   */
  @deserialize
  _links: {
    self: HALLink;
  };

}
