import { ResourceType } from '../../shared/resource-type';

/**
 * The resource type for CvEntity
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const CV_ENTITY = new ResourceType('cventity');
