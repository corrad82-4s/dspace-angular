import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { createSelector, select, Store } from '@ngrx/store';
import { Operation } from 'fast-json-patch/lib/core';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, filter, find, map, skipWhile, switchMap, take, tap } from 'rxjs/operators';
import {
  GroupRegistryCancelGroupAction,
  GroupRegistryEditGroupAction
} from '../../+admin/admin-access-control/group-registry/group-registry.actions';
import { GroupRegistryState } from '../../+admin/admin-access-control/group-registry/group-registry.reducers';
import { AppState } from '../../app.reducer';
import { hasValue } from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestParam } from '../cache/models/request-param.model';
import { ObjectCacheService } from '../cache/object-cache.service';
import { ErrorResponse, RestResponse } from '../cache/response.models';
import { DataService } from '../data/data.service';
import { DSOChangeAnalyzer } from '../data/dso-change-analyzer.service';
import { PaginatedList } from '../data/paginated-list';
import { RemoteData } from '../data/remote-data';
import {
  CreateRequest,
  DeleteRequest,
  FindListOptions,
  FindListRequest,
  PatchRequest,
  PostRequest
} from '../data/request.models';
import { RequestService } from '../data/request.service';
import { HttpOptions } from '../dspace-rest-v2/dspace-rest-v2.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { getRemoteDataPayload, getResponseFromEntry, getSucceededRemoteData } from '../shared/operators';
import { EPerson } from './models/eperson.model';
import { Group } from './models/group.model';
import { dataService } from '../cache/builders/build-decorators';
import { GROUP } from './models/group.resource-type';
import { DSONameService } from '../breadcrumbs/dso-name.service';
import { Community } from '../shared/community.model';
import { Collection } from '../shared/collection.model';

const groupRegistryStateSelector = (state: AppState) => state.groupRegistry;
const editGroupSelector = createSelector(groupRegistryStateSelector, (groupRegistryState: GroupRegistryState) => groupRegistryState.editGroup);

/**
 * Provides methods to retrieve eperson group resources from the REST API & Group related CRUD actions.
 */
@Injectable({
  providedIn: 'root'
})
@dataService(GROUP)
export class GroupDataService extends DataService<Group> {
  protected linkPath = 'groups';
  protected browseEndpoint = '';
  public ePersonsEndpoint = 'epersons';
  public subgroupsEndpoint = 'subgroups';

  constructor(
    protected comparator: DSOChangeAnalyzer<Group>,
    protected http: HttpClient,
    protected notificationsService: NotificationsService,
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<any>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected nameService: DSONameService,
  ) {
    super();
  }

  /**
   * Retrieves all groups
   * @param pagination The pagination info used to retrieve the groups
   */
  public getGroups(options: FindListOptions = {}, ...linksToFollow: Array<FollowLinkConfig<Group>>): Observable<RemoteData<PaginatedList<Group>>> {
    const hrefObs = this.getFindAllHref(options, this.linkPath, ...linksToFollow);
    hrefObs.pipe(
      filter((href: string) => hasValue(href)),
      take(1))
      .subscribe((href: string) => {
        const request = new FindListRequest(this.requestService.generateRequestId(), href, options);
        this.requestService.configure(request);
      });

    return this.rdbService.buildList<Group>(hrefObs) as Observable<RemoteData<PaginatedList<Group>>>;
  }

  /**
   * Returns a search result list of groups, with certain query (searches in group name and by exact uuid)
   * Endpoint used: /eperson/groups/search/byMetadata?query=<:name>
   * @param query     search query param
   * @param options
   * @param linksToFollow
   */
  public searchGroups(query: string, options?: FindListOptions, ...linksToFollow: Array<FollowLinkConfig<Group>>): Observable<RemoteData<PaginatedList<Group>>> {
    const searchParams = [new RequestParam('query', query)];
    let findListOptions = new FindListOptions();
    if (options) {
      findListOptions = Object.assign(new FindListOptions(), options);
    }
    if (findListOptions.searchParams) {
      findListOptions.searchParams = [...findListOptions.searchParams, ...searchParams];
    } else {
      findListOptions.searchParams = searchParams;
    }
    return this.searchBy('byMetadata', findListOptions, ...linksToFollow);
  }

  /**
   * Check if the current user is member of to the indicated group
   *
   * @param groupName
   *    the group name
   * @return boolean
   *    true if user is member of the indicated group, false otherwise
   */
  isMemberOf(groupName: string): Observable<boolean> {
    const searchHref = 'isMemberOf';
    const options = new FindListOptions();
    options.searchParams = [new RequestParam('groupName', groupName)];

    return this.searchBy(searchHref, options).pipe(
      getRemoteDataPayload(),
      map((groups: PaginatedList<Group>) => groups.totalElements > 0),
      catchError(() => observableOf(false)),
    );
  }

  /**
   * Make a new FindListRequest with given search method
   *
   * @param searchMethod The search method for the object
   * @param options The [[FindListOptions]] object
   * @param linksToFollow The array of [[FollowLinkConfig]]
   * @return {Observable<RemoteData<PaginatedList<T>>}
   *    Return an observable that emits response from the server
   */
  searchBy(searchMethod: string, options: FindListOptions = {}, ...linksToFollow: Array<FollowLinkConfig<Group>>): Observable<RemoteData<PaginatedList<Group>>> {

    const hrefObs = this.getSearchByHref(searchMethod, options, ...linksToFollow);

    return hrefObs.pipe(
      find((href: string) => hasValue(href)),
      tap((href: string) => {
          this.requestService.removeByHrefSubstring(href);
          const request = new FindListRequest(this.requestService.generateRequestId(), href, options);
          if (hasValue(this.responseMsToLive)) {
            request.responseMsToLive = this.responseMsToLive;
          }

          this.requestService.configure(request);
        }
      ),
      switchMap((href) => this.requestService.getByHref(href)),
      skipWhile((requestEntry) => hasValue(requestEntry) && requestEntry.completed),
      switchMap((href) =>
        this.rdbService.buildList<Group>(hrefObs, ...linksToFollow) as Observable<RemoteData<PaginatedList<Group>>>
      )
    );
  }

  /**
   * Method to delete a group
   * @param group The group to delete
   */
  public deleteGroup(group: Group): Observable<[boolean, string]> {
    return this.delete(group.id).pipe(map((response: RestResponse) => {
      const errorMessage = response.isSuccessful === false ? (response as ErrorResponse).errorMessage : undefined;
      return [response.isSuccessful, errorMessage];
    }));
  }

  /**
   * Create a group
   * @param group    The group to create
   */
  public createGroup(group: Group): Observable<RemoteData<Group>> {
    return this.create(group, null);
  }

  /**
   * Add a new patch to the object cache
   * The patch is derived from the differences between the given object and its version in the object cache
   * @param group The group with changes
   */
  updateGroup(group: Group): Observable<RestResponse> {
    const requestId = this.requestService.generateRequestId();
    const oldVersion$ = this.findByHref(group._links.self.href);
    oldVersion$.pipe(
      getSucceededRemoteData(),
      getRemoteDataPayload(),
      map((oldGroup: Group) => {
        const operations = this.generateOperations(oldGroup, group);
        const patchRequest = new PatchRequest(requestId, group._links.self.href, operations);
        return this.requestService.configure(patchRequest);
      }),
      take(1)
    ).subscribe();

    return this.fetchResponse(requestId);
  }

  /**
   * Adds given subgroup as a subgroup to the given active group
   * @param activeGroup   Group we want to add subgroup to
   * @param subgroup      Group we want to add as subgroup to activeGroup
   */
  addSubGroupToGroup(activeGroup: Group, subgroup: Group): Observable<RestResponse> {
    const requestId = this.requestService.generateRequestId();
    const options: HttpOptions = Object.create({});
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'text/uri-list');
    options.headers = headers;
    const postRequest = new PostRequest(requestId, activeGroup.self + '/' + this.subgroupsEndpoint, subgroup.self, options);
    this.requestService.configure(postRequest);

    return this.fetchResponse(requestId);
  }

  /**
   * Deletes a given subgroup from the subgroups of the given active group
   * @param activeGroup   Group we want to delete subgroup from
   * @param subgroup      Subgroup we want to delete from activeGroup
   */
  deleteSubGroupFromGroup(activeGroup: Group, subgroup: Group): Observable<RestResponse> {
    const requestId = this.requestService.generateRequestId();
    const deleteRequest = new DeleteRequest(requestId, activeGroup.self + '/' + this.subgroupsEndpoint + '/' + subgroup.id);
    this.requestService.configure(deleteRequest);

    return this.fetchResponse(requestId);
  }

  /**
   * Adds given ePerson as member to given group
   * @param activeGroup   Group we want to add member to
   * @param ePerson       EPerson we want to add as member to given activeGroup
   */
  addMemberToGroup(activeGroup: Group, ePerson: EPerson): Observable<RestResponse> {
    const requestId = this.requestService.generateRequestId();
    const options: HttpOptions = Object.create({});
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'text/uri-list');
    options.headers = headers;
    const postRequest = new PostRequest(requestId, activeGroup.self + '/' + this.ePersonsEndpoint, ePerson.self, options);
    this.requestService.configure(postRequest);

    return this.fetchResponse(requestId);
  }

  /**
   * Deletes a given ePerson from the members of the given active group
   * @param activeGroup   Group we want to delete member from
   * @param ePerson       EPerson we want to delete from members of given activeGroup
   */
  deleteMemberFromGroup(activeGroup: Group, ePerson: EPerson): Observable<RestResponse> {
    const requestId = this.requestService.generateRequestId();
    const deleteRequest = new DeleteRequest(requestId, activeGroup.self + '/' + this.ePersonsEndpoint + '/' + ePerson.id);
    this.requestService.configure(deleteRequest);

    return this.fetchResponse(requestId);
  }

  /**
   * Gets the restResponse from the requestService
   * @param requestId
   */
  protected fetchResponse(requestId: string): Observable<RestResponse> {
    return this.requestService.getByUUID(requestId).pipe(
      getResponseFromEntry(),
      map((response: RestResponse) => {
        return response;
      })
    );
  }

  /**
   * Method to retrieve the group that is currently being edited
   */
  public getActiveGroup(): Observable<Group> {
    return this.store.pipe(select(editGroupSelector))
  }

  /**
   * Method to cancel editing a group, dispatches a cancel group action
   */
  public cancelEditGroup() {
    this.store.dispatch(new GroupRegistryCancelGroupAction());
  }

  /**
   * Method to set the group being edited, dispatches an edit group action
   * @param group The group to edit
   */
  public editGroup(group: Group) {
    this.store.dispatch(new GroupRegistryEditGroupAction(group));
  }

  /**
   * Method that clears a cached groups request
   */
  public clearGroupsRequests(): void {
    this.getBrowseEndpoint().pipe(take(1)).subscribe((link: string) => {
      this.requestService.removeByHrefSubstring(link);
    });
  }

  /**
   * Method that clears a cached get subgroups of certain group request
   */
  public clearGroupLinkRequests(href: string): void {
    this.requestService.removeByHrefSubstring(href);
  }

  public getGroupRegistryRouterLink(): string {
    return '/admin/access-control/groups';
  }

  /**
   * Change which group is being edited and return the link for the edit page of the new group being edited
   * @param newGroup New group to edit
   */
  public startEditingNewGroup(newGroup: Group): string {
    this.getActiveGroup().pipe(take(1)).subscribe((activeGroup: Group) => {
      if (newGroup === activeGroup) {
        this.cancelEditGroup()
      } else {
        this.editGroup(newGroup)
      }
    });
    return this.getGroupEditPageRouterLinkWithID(newGroup.id)
  }

  /**
   * Get Edit page of group
   * @param group Group we want edit page for
   */
  public getGroupEditPageRouterLink(group: Group): string {
    return this.getGroupEditPageRouterLinkWithID(group.id);
  }

  /**
   * Get Edit page of group
   * @param groupID Group ID we want edit page for
   */
  public getGroupEditPageRouterLinkWithID(groupId: string): string {
    return '/admin/access-control/groups/' + groupId;
  }

  /**
   * Extract optional UUID from a string
   * @param stringWithUUID  String with possible UUID
   */
  public getUUIDFromString(stringWithUUID: string): string {
    let foundUUID = '';
    const uuidMatches = stringWithUUID.match(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/g);
    if (uuidMatches != null) {
      foundUUID = uuidMatches[0];
    }
    return foundUUID;
  }

  /**
   * Create a group for a given role for a given community or collection.
   *
   * @param dso         The community or collection for which to create a group
   * @param role        The name of the role for which to create a group
   * @param link        The REST endpoint to create the group
   */
  createComcolGroup(dso: Community|Collection, role: string, link: string): Observable<RestResponse> {

    const requestId = this.requestService.generateRequestId();
    const group = Object.assign(new Group(), {
      metadata: {
        'dc.description': [
          {
            value: `${this.nameService.getName(dso)} ${role} group`,
          }
        ],
      },
    });

    this.requestService.configure(
      new CreateRequest(
        requestId,
        link,
        JSON.stringify(group),
      ));

    return this.requestService.getByUUID(requestId).pipe(
      getResponseFromEntry(),
      tap(() => this.requestService.removeByHrefSubstring(link)),
    );
  }

  /**
   * Delete the group for a given role for a given community or collection.
   *
   * @param link        The REST endpoint to delete the group
   */
  deleteComcolGroup(link: string): Observable<RestResponse> {

    const requestId = this.requestService.generateRequestId();

    this.requestService.configure(
      new DeleteRequest(
        requestId,
        link,
      ));

    return this.requestService.getByUUID(requestId).pipe(
      getResponseFromEntry(),
      tap(() => this.requestService.removeByHrefSubstring(link)),
    );
  }

  /**
   * Returns true if the active group is a role group (role, institutional role or institutional scoped role).
   */
  public isActiveGroupRole(): Observable<boolean> {
    return this.getActiveGroup().pipe (map( (activeGroup) => {
      return activeGroup != null && (activeGroup.firstMetadataValue('perucris.group.type') === 'ROLE' ||
        activeGroup.firstMetadataValue('perucris.group.type') === 'INSTITUTIONAL' ||
        activeGroup.firstMetadataValue('perucris.group.type') === 'SCOPED');
    }))
  }

  /**
   * Returns true if the active group is enabled.
   */
  public isActiveGroupEnabled(): Observable<boolean> {
    return this.getActiveGroup().pipe (map( (activeGroup) => {
      return activeGroup != null && ( !activeGroup.hasMetadata('perucris.group.status') || activeGroup.firstMetadataValue('perucris.group.status') === 'ENABLED');
    }))
  }

  /**
   * Metadata operations are generated by the difference between old and new Group
   * Custom replace operations for the other Group values
   * The operations generated by this method are based only on the values of the metadata
   * and on the name of the group
   * @param oldGroup
   * @param newGroup
   */
  private generateOperations(oldGroup: Group, newGroup: Group): Operation[] {
    let operations = this.comparator.diff(oldGroup, newGroup);
    if (hasValue(oldGroup.name) && oldGroup.name !== newGroup.name) {
      operations = [...operations, {
        op: 'replace', path: '/name', value: newGroup.name
      }];
    }
    return operations;
  }
}
