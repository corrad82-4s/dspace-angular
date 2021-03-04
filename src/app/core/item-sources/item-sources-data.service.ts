import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { dataService } from '../cache/builders/build-decorators';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { CoreState } from '../core.reducers';
import { EPersonDataService } from '../eperson/eperson-data.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { DataService } from '../data/data.service';
import { DefaultChangeAnalyzer } from '../data/default-change-analyzer.service';
import { RequestService } from '../data/request.service';

import { DSONameService } from '../breadcrumbs/dso-name.service';
import { ItemSources } from './model/item-sources.model';
import { ITEM_SOURCES } from './model/item-sources.resource-type';
import { Observable } from 'rxjs';
import { RemoteData } from '../data/remote-data';


/* tslint:disable:max-classes-per-file */

/**
 * A private DataService implementation to delegate specific methods to.
 */
class ItemSourcesDataServiceImpl extends DataService<ItemSources> {
  protected linkPath = 'itemsources';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<ItemSources>) {
    super();
  }

}

@Injectable()
@dataService(ITEM_SOURCES)
export class ItemSourcesDataService {

  dataService: ItemSourcesDataServiceImpl;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected ePersonService: EPersonDataService,
    protected dsoNameService: DSONameService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<ItemSources>) {

    this.dataService = new ItemSourcesDataServiceImpl(requestService, rdbService, store, objectCache, halService,
      notificationsService, http, comparator);
  }

  findById(id: string): Observable<RemoteData<ItemSources>> {
    return this.dataService.findById(id);
  }

}
