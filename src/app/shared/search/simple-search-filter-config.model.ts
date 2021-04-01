import { ResourceType } from './../../core/shared/resource-type';
import { FilterType } from './filter-type.model';
import { autoserialize, autoserializeAs, deserialize } from 'cerialize';
import { HALLink } from '../../core/shared/hal-link.model';
import { typedObject } from '../../core/cache/builders/build-decorators';
import { CacheableObject } from '../../core/cache/object-cache.reducer';
import { excludeFromEquals } from '../../core/utilities/equals.decorators';
import { SIMPLE_SEARCH_FILTER_CONFIG } from './simple-search-filter-config.resource-type';

  /**
   * The configuration for a search filter
   */
@typedObject
  export class SimpleSearchFilterConfig implements CacheableObject {
    static type = SIMPLE_SEARCH_FILTER_CONFIG;

    /**
     * The object type,
     * hardcoded because rest doesn't set one.
     */
    @excludeFromEquals
    type = SIMPLE_SEARCH_FILTER_CONFIG;

    /**
     * The name of this filter
     */
    @autoserializeAs(String, 'filter')
    name: string;

    /**
     * The FilterType of this filter
     */
    @autoserializeAs(String, 'type')
    filterType: FilterType;

    /**
     * True if the filter has facets
     */
    @autoserialize
    hasFacets: boolean;

    /**
     * @type {number} The page size used for this facet
     */
    @autoserialize
    pageSize = 5;

    /**
     * Defines if the item facet is collapsed by default or not on the search page
     */
    @autoserialize
    isOpenByDefault: boolean;

    /**
     * Defines the list of available operators
     */
    @autoserialize
    operators: OperatorConfig[];


    /**
     * Minimum value possible for this facet in the repository
     */
    @autoserialize
    maxValue: string;

    /**
     * Maximum value possible for this facet in the repository
     */
    @autoserialize
    minValue: string;

    /**
     * The {@link HALLink}s for this SearchFilterConfig
     */
    @deserialize
    _links: {
      self: HALLink;
    };

    /**
     * Name of this configuration that can be used in a url
     * @returns Parameter name
     */
    get paramName(): string {
      return 'f.' + this.name;
    }
  }

/**
 * Interface to model sort option's configuration.
 */
export interface SortOption {
  name: string;
}

/**
 * Interface to model operator's configuration.
 */
export interface OperatorConfig {
  operator: string;
}
