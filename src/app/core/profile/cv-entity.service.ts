import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { dataService } from '../cache/builders/build-decorators';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestParam } from '../cache/models/request-param.model';
import { ObjectCacheService } from '../cache/object-cache.service';
import { CoreState } from '../core.reducers';
import { DataService } from '../data/data.service';
import { DefaultChangeAnalyzer } from '../data/default-change-analyzer.service';
import { ItemDataService } from '../data/item-data.service';
import { RequestService } from '../data/request.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import {
  getFinishedRemoteData
} from '../shared/operators';
import { CvEntity } from './model/cv-entity.model';
import { CV_ENTITY } from './model/cv-entity.resource-type';



/* tslint:disable:max-classes-per-file */

/**
 * A private DataService implementation to delegate specific methods to.
 */
class CvEntityServiceImpl extends DataService<CvEntity> {
    protected linkPath = 'cventities';

    constructor(
      protected requestService: RequestService,
      protected rdbService: RemoteDataBuildService,
      protected store: Store<CoreState>,
      protected objectCache: ObjectCacheService,
      protected halService: HALEndpointService,
      protected notificationsService: NotificationsService,
      protected http: HttpClient,
      protected comparator: DefaultChangeAnalyzer<CvEntity>) {
      super();
    }

}

/**
 * A service that provides methods to make REST requests with researcher profile endpoint.
 */
@Injectable()
@dataService(CV_ENTITY)
export class CvEntityService {

    dataService: CvEntityServiceImpl;

    responseMsToLive: number = 10 * 1000;

    constructor(
        protected requestService: RequestService,
        protected rdbService: RemoteDataBuildService,
        protected store: Store<CoreState>,
        protected objectCache: ObjectCacheService,
        protected halService: HALEndpointService,
        protected notificationsService: NotificationsService,
        protected http: HttpClient,
        protected comparator: DefaultChangeAnalyzer<CvEntity>,
        protected itemService: ItemDataService ) {

        this.dataService = new CvEntityServiceImpl(requestService, rdbService, store, objectCache, halService,
            notificationsService, http, comparator);

    }

    /**
     * Create a new cv entity related to the given item.
     */
    create(itemId: string): Observable<CvEntity> {
      return this.dataService.create( new CvEntity(), new RequestParam('item', itemId)).pipe (
        getFinishedRemoteData(),
        map((remoteData) => remoteData.payload)
      );
    }

}
