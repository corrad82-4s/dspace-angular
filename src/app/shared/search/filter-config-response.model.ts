import { SimpleSearchFilterConfig } from './simple-search-filter-config.model';
import { CacheableObject } from '../../core/cache/object-cache.reducer';
import { typedObject } from '../../core/cache/builders/build-decorators';
import { excludeFromEquals } from '../../core/utilities/equals.decorators';
import { deserialize } from 'cerialize';
import { HALLink } from '../../core/shared/hal-link.model';
import { SEARCH_FILTER_CONFIG } from './search-filter-config.resource-type';

/**
 * The response from the discover/facets endpoint
 */
@typedObject
export class FilterConfigResponse implements CacheableObject {
  static type = SEARCH_FILTER_CONFIG;

  /**
   * The object type,
   * hardcoded because rest doesn't a unique one.
   */
  @excludeFromEquals
  type = SEARCH_FILTER_CONFIG;

  /**
   * the filters in this response
   */
  filters: SimpleSearchFilterConfig[];

  /**
   * The {@link HALLink}s for this SearchFilterConfig
   */
  @deserialize
  _links: {
    self: HALLink;
  };
}
