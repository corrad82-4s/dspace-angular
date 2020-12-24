import { DataService } from './data.service';
import { Root } from './root.model';
import { Injectable } from '@angular/core';
import { ROOT } from './root.resource-type';
import { dataService } from '../cache/builders/build-decorators';
import { RequestService } from './request.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { Store } from '@ngrx/store';
import { CoreState } from '../core.reducers';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { HttpClient } from '@angular/common/http';
import { DefaultChangeAnalyzer } from './default-change-analyzer.service';
import { Observable } from 'rxjs';
import { RemoteData } from './remote-data';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { FindListOptions } from './request.models';
import { PaginatedList } from './paginated-list';

/* tslint:disable:max-classes-per-file */

/**
 * A private DataService implementation to delegate specific methods to.
 */
class DataServiceImpl extends DataService<Root> {
  protected linkPath = '';
  protected responseMsToLive = 6 * 60 * 60 * 1000;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<Root>) {
    super();
  }
}

/**
 * A service to retrieve the {@link Root} object from the REST API.
 */
@Injectable()
@dataService(ROOT)
export class RootDataService {
  /**
   * A private DataService instance to delegate specific methods to.
   */
  private dataService: DataServiceImpl;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<Root>) {
    this.dataService = new DataServiceImpl(requestService, rdbService, null, objectCache, halService, notificationsService, http, comparator);
  }

  /**
   * Find the {@link Root} object of the REST API
   * @param linksToFollow List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved
   */
  findRoot(...linksToFollow: Array<FollowLinkConfig<Root>>): Observable<RemoteData<Root>> {
    return this.dataService.findByHref(this.halService.getRootHref(), ...linksToFollow);
  }

  /**
   * Returns an observable of {@link RemoteData} of an object, based on an href, with a list of {@link FollowLinkConfig},
   * to automatically resolve {@link HALLink}s of the object
   * @param href            The url of object we want to retrieve
   * @param linksToFollow   List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved
   */
  findByHref(href: string, ...linksToFollow: Array<FollowLinkConfig<Root>>): Observable<RemoteData<Root>> {
    return this.dataService.findByHref(href, ...linksToFollow);
  }

  /**
   * Returns a list of observables of {@link RemoteData} of objects, based on an href, with a list of {@link FollowLinkConfig},
   * to automatically resolve {@link HALLink}s of the object
   * @param href            The url of object we want to retrieve
   * @param findListOptions Find list options object
   * @param linksToFollow   List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved
   */
  findAllByHref(href: string, findListOptions: FindListOptions = {}, ...linksToFollow: Array<FollowLinkConfig<Root>>): Observable<RemoteData<PaginatedList<Root>>> {
    return this.dataService.findAllByHref(href, findListOptions, ...linksToFollow);
  }
}
/* tslint:enable:max-classes-per-file */
