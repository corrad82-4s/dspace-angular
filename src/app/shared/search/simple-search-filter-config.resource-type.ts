import { ResourceType } from '../../core/shared/resource-type';

/**
 * The resource type for SearchFilterConfig
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const SIMPLE_SEARCH_FILTER_CONFIG = new ResourceType('simple-discovery-filter');
