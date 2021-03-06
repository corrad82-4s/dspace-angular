import { ResourceType } from '../resource-type';

/**
 * The resource type for Relationship.
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const RELATIONSHIP = new ResourceType('relationship');
