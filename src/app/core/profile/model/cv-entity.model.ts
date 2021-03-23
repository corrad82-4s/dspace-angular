import { autoserialize, deserialize, deserializeAs } from 'cerialize';
import { typedObject } from '../../cache/builders/build-decorators';
import { CacheableObject } from '../../cache/object-cache.reducer';
import { HALLink } from '../../shared/hal-link.model';
import { ResourceType } from '../../shared/resource-type';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { CV_ENTITY } from './cv-entity.resource-type';

/**
 * Class the represents a CV entity.
 */
@typedObject
export class CvEntity extends CacheableObject {

  static type = CV_ENTITY;

  /**
   * The object type
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * The identifier of this CV entity
   */
  @autoserialize
  id: string;

  @deserializeAs('id')
  uuid: string;

  /**
   * The {@link HALLink}s for this CV entity
   */
  @deserialize
  _links: {
    self: HALLink,
    item: HALLink
  };

}
