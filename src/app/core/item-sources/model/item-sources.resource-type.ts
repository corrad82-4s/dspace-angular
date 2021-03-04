/**
 * The resource type for Sources
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
import { ResourceType } from '../../shared/resource-type';

export const ITEM_SOURCES = new ResourceType('itemsource');
