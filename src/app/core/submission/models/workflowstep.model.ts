import { autoserialize, deserialize, inheritSerialization } from "cerialize";
import { typedObject } from "../../cache/builders/build-decorators";
import { CacheableObject } from "../../cache/object-cache.reducer";
import { DSpaceObject } from "../../shared/dspace-object.model";
import { HALLink } from "../../shared/hal-link.model";
import { ResourceType } from "../../shared/resource-type";

/**
 * A model class for a WorkflowStep.
 */
@typedObject
@inheritSerialization(DSpaceObject)
export class WorkflowStep extends DSpaceObject implements CacheableObject {

  static type = new ResourceType('workflowstep');
  
  @deserialize
  _links: { 
    self: HALLink; 
    workflowactions: HALLink;
  };

  @autoserialize
  type: ResourceType;

  @autoserialize
  id: string;

  @autoserialize
  roleId: string;
}