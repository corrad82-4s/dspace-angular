import { Injectable } from '@angular/core';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { RelationshipService } from '../../../core/data/relationship.service';
import { Observable } from 'rxjs/internal/Observable';
import { SourcesCorrectionsUtilsService } from './sources-corrections-utils.service';
import { ItemSourcesDataService } from '../../../core/item-sources/item-sources-data.service';
import { ItemSources } from '../../../core/item-sources/model/item-sources.model';
import { Item } from '../../../core/shared/item.model';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';

@Injectable({providedIn: 'root'})
export class SourcesOfInformationService {

  constructor(protected authorizationService: AuthorizationDataService,
              protected relationshipService: RelationshipService,
              protected sourcesCorrectionsUtilsService: SourcesCorrectionsUtilsService,
              protected itemSourcesDataService: ItemSourcesDataService) { }

  public getItemSources(itemUuid: string): Observable<ItemSources> {

    return this.itemSourcesDataService.findById(itemUuid).pipe(getFirstSucceededRemoteDataPayload());
  }

  public getItemLabel(item: Item): Observable<string> {
    return this.sourcesCorrectionsUtilsService.getItemLabel(item);
  }

}
