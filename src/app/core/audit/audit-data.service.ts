import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { Audit } from 'src/app/core/audit/model/audit.model';
import { AUDIT } from 'src/app/core/audit/model/audit.resource-type';
import { map, startWith } from 'rxjs/operators';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { dataService } from '../cache/builders/build-decorators';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestParam } from '../cache/models/request-param.model';
import { ObjectCacheService } from '../cache/object-cache.service';
import { CoreState } from '../core.reducers';
import { EPersonDataService } from '../eperson/eperson-data.service';
import { EPerson } from '../eperson/models/eperson.model';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { DataService } from '../data/data.service';
import { DefaultChangeAnalyzer } from '../data/default-change-analyzer.service';
import { PaginatedList } from '../data/paginated-list';
import { RemoteData } from '../data/remote-data';
import { FindListOptions } from '../data/request.models';
import { RequestService } from '../data/request.service';
import {
  getFirstSucceededRemoteDataPayload,
  getFirstSucceededRemoteDataWithNotEmptyPayload,
} from '../shared/operators';

import {DSONameService} from '../breadcrumbs/dso-name.service';
import {followLink, FollowLinkConfig} from '../../shared/utils/follow-link-config.model';

/* tslint:disable:max-classes-per-file */

export const AUDIT_PERSON_NOT_AVAILABLE = 'n/a'

export const AUDIT_FIND_BY_OBJECT_SEARCH_METHOD = 'findByObject';

/**
 * A private DataService implementation to delegate specific methods to.
 */
class AuditDataServiceImpl extends DataService<Audit> {
  protected linkPath = 'auditevents';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<Audit>) {
    super();
  }

}

@Injectable()
@dataService(AUDIT)
export class AuditDataService {

  dataService: AuditDataServiceImpl;

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
    protected comparator: DefaultChangeAnalyzer<Audit>) {

    this.dataService = new AuditDataServiceImpl(requestService, rdbService, store, objectCache, halService,
      notificationsService, http, comparator);
  }

  /**
   * Get all audit event for the object.
   *
   * @param objectId The objectId id
   * @param options The [[FindListOptions]] object
   * @return Observable<RemoteData<PaginatedList<Audit>>>
   */
  findByObject(objectId: string, options: FindListOptions = {}): Observable<RemoteData<PaginatedList<Audit>>> {
    const searchMethod = AUDIT_FIND_BY_OBJECT_SEARCH_METHOD;
    const optionsWithObject = Object.assign(new FindListOptions(), options, {
      searchParams: [new RequestParam('object', objectId)]
    });
    return this.dataService.searchBy(searchMethod, optionsWithObject, followLink('eperson'));
  }

  findById(id: string): Observable<RemoteData<Audit>> {
    return this.dataService.findById(id, followLink('eperson'));
  }

  findAll(options: FindListOptions = {}): Observable<RemoteData<PaginatedList<Audit>>> {
    return this.dataService.findAll(options, followLink('eperson'));
  }

  /**
   * Get the name of the eperson related to the audit.
   * @param id  ID of the EPerson
   */
  getEpersonName(audit: Audit): Observable<string> {

    if (!audit.epersonUUID) {
      return of(AUDIT_PERSON_NOT_AVAILABLE);
    }

    // TODO to be reviewed when https://github.com/DSpace/dspace-angular/issues/644 will be resolved
    return audit.eperson.pipe(
      getFirstSucceededRemoteDataWithNotEmptyPayload(),
      map((eperson: EPerson) => this.dsoNameService.getName(eperson)),
      startWith(AUDIT_PERSON_NOT_AVAILABLE));
  }

  /**
   *
   * @param audit
   * @param subjectId
   */
  getOtherObject(audit: Audit, contextObjectId: string): Observable<any> {
    const otherObjectHref = this.getOtherObjectHref(audit, contextObjectId);

    if (otherObjectHref) {
      return this.dataService.findByHref(otherObjectHref).pipe(getFirstSucceededRemoteDataPayload());
    }
    return of(null);
  }

  getOtherObjectHref(audit: Audit, contextObjectId: string) {
    if (audit.objectUUID !== null && contextObjectId === audit.objectUUID) {
      // other object is on the subject field
      return audit._links.subject.href;
    }
    if (audit.objectUUID !== null && contextObjectId === audit.subjectUUID) {
      // other object is on the object field
      return audit._links.object.href;
    }
    return null;
  }

}
