import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  Observable,
  of as observableOf,
  Subscription
} from 'rxjs';
import { catchError, first, map, switchMap, take } from 'rxjs/operators';
import { DSpaceObjectDataService } from '../../core/data/dspace-object-data.service';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { buildPaginatedList, PaginatedList } from '../../core/data/paginated-list.model';
import { RemoteData } from '../../core/data/remote-data';
import { RequestService } from '../../core/data/request.service';
import { EPersonDataService } from '../../core/eperson/eperson-data.service';
import { GroupDataService } from '../../core/eperson/group-data.service';
import { EPerson } from '../../core/eperson/models/eperson.model';
import { GroupDtoModel } from '../../core/eperson/models/group-dto.model';
import { Group } from '../../core/eperson/models/group.model';
import { RouteService } from '../../core/services/route.service';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import {
  getAllSucceededRemoteData,
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteData,
  getRemoteDataPayload
} from '../../core/shared/operators';
import { PageInfo } from '../../core/shared/page-info.model';
import { hasValue } from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';
import { NoContent } from '../../core/shared/NoContent.model';
import { PaginationService } from '../../core/pagination/pagination.service';
import { Operation } from 'fast-json-patch';

@Component({
  selector: 'ds-groups-registry',
  templateUrl: './groups-registry.component.html',
})
/**
 * A component used for managing all existing groups within the repository.
 * The admin can create, edit or delete groups here.
 */
export class GroupsRegistryComponent implements OnInit, OnDestroy {

  messagePrefix = 'admin.access-control.groups.';

  /**
   * Pagination config used to display the list of groups
   */
  config: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'gl',
    pageSize: 5,
    currentPage: 1
  });

  /**
   * A BehaviorSubject with the list of GroupDtoModel objects made from the Groups in the repository or
   * as the result of the search
   */
  groupsDto$: BehaviorSubject<PaginatedList<GroupDtoModel>> = new BehaviorSubject<PaginatedList<GroupDtoModel>>({} as any);
  deletedGroupsIds: string[] = [];

  /**
   * An observable for the pageInfo, needed to pass to the pagination component
   */
  pageInfoState$: BehaviorSubject<PageInfo> = new BehaviorSubject<PageInfo>(undefined);

  // The search form
  searchForm;

  /**
   * A boolean representing if a search is pending
   */
  searching$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Current search in groups registry
  currentSearchQuery: string;

  /**
   * The subscription for the search method
   */
  searchSub: Subscription;

  paginationSub: Subscription;

  /**
   * List of subscriptions
   */
  subs: Subscription[] = [];

  constructor(public groupService: GroupDataService,
              private ePersonDataService: EPersonDataService,
              private dSpaceObjectDataService: DSpaceObjectDataService,
              private translateService: TranslateService,
              private notificationsService: NotificationsService,
              private formBuilder: FormBuilder,
              protected routeService: RouteService,
              private router: Router,
              private authorizationService: AuthorizationDataService,
              private paginationService: PaginationService,
              public requestService: RequestService) {
    this.currentSearchQuery = '';
    this.searchForm = this.formBuilder.group(({
      query: this.currentSearchQuery,
    }));
  }

  ngOnInit() {
    this.search({ query: this.currentSearchQuery });
  }

  /**
   * Search in the groups (searches by group name and by uuid exact match)
   * @param data  Contains query param
   */
  search(data: any) {
    this.searching$.next(true);
    if (hasValue(this.searchSub)) {
      this.searchSub.unsubscribe();
      this.subs = this.subs.filter((sub: Subscription) => sub !== this.searchSub);
    }
    this.searchSub = this.paginationService.getCurrentPagination(this.config.id, this.config).pipe(
      switchMap((paginationOptions) => {
        const query: string = data.query;
        if (query != null && this.currentSearchQuery !== query) {
          this.currentSearchQuery = query;
          this.paginationService.updateRouteWithUrl(this.config.id, [], {page: 1});
        }
        return this.groupService.searchGroups(this.currentSearchQuery.trim(), {
          currentPage: paginationOptions.currentPage,
          elementsPerPage: paginationOptions.pageSize
        });
      }),
      getAllSucceededRemoteData(),
      getRemoteDataPayload(),
      switchMap((groups: PaginatedList<Group>) => {
        if (groups.page.length === 0) {
          return observableOf(buildPaginatedList(groups.pageInfo, []));
        }
        return observableCombineLatest(groups.page.map((group: Group) => {
          if (!this.deletedGroupsIds.includes(group.id)) {
            return observableCombineLatest([
              this.authorizationService.isAuthorized(FeatureID.CanDelete, hasValue(group) ? group.self : undefined),
              this.hasLinkedDSO(group),
              this.getSubgroups(group),
              this.getMembers(group)
            ]).pipe(
              map(([isAuthorized, hasLinkedDSO, subgroups, members]:
                     [boolean, boolean, RemoteData<PaginatedList<Group>>, RemoteData<PaginatedList<EPerson>>]) => {
                  const groupDtoModel: GroupDtoModel = new GroupDtoModel();
                  groupDtoModel.ableToDelete = isAuthorized && !hasLinkedDSO;
                  groupDtoModel.group = group;
                  groupDtoModel.subgroups = subgroups.payload;
                  groupDtoModel.epersons = members.payload;
                  return groupDtoModel;
                }
              )
            );
          }
        })).pipe(map((dtos: GroupDtoModel[]) => {
          return buildPaginatedList(groups.pageInfo, dtos);
        }));
      })
    ).subscribe((value: PaginatedList<GroupDtoModel>) => {
      this.groupsDto$.next(value);
      this.pageInfoState$.next(value.pageInfo);
      this.searching$.next(false);
    });

    this.subs.push(this.searchSub);
      }

  /**
   * Delete Group
   */
  deleteGroup(group: GroupDtoModel) {
    if (hasValue(group.group.id)) {
      this.groupService.delete(group.group.id).pipe(getFirstCompletedRemoteData())
        .subscribe((rd: RemoteData<NoContent>) => {
          if (rd.hasSucceeded) {
            this.deletedGroupsIds = [...this.deletedGroupsIds, group.group.id];
            this.notificationsService.success(this.translateService.get(this.messagePrefix + 'notification.deleted.success', { name: group.group.name }));
            this.reset();
          } else {
            this.notificationsService.error(
              this.translateService.get(this.messagePrefix + 'notification.deleted.failure.title', { name: group.group.name }),
              this.translateService.get(this.messagePrefix + 'notification.deleted.failure.content', { cause: rd.errorMessage }));
          }
      });
    }
  }

  /**
   * This method will set everything to stale, which will cause the lists on this page to update.
   */
  reset() {
    this.groupService.getBrowseEndpoint().pipe(
      take(1)
    ).subscribe((href: string) => {
      this.requestService.setStaleByHrefSubstring(href);
    });
  }

  /**
   * Get the members (epersons embedded value of a group)
   * @param group
   */
  getMembers(group: Group): Observable<RemoteData<PaginatedList<EPerson>>> {
    return this.ePersonDataService.findAllByHref(group._links.epersons.href).pipe(getFirstSucceededRemoteData());
  }

  /**
   * Get the subgroups (groups embedded value of a group)
   * @param group
   */
  getSubgroups(group: Group): Observable<RemoteData<PaginatedList<Group>>> {
    return this.groupService.findAllByHref(group._links.subgroups.href).pipe(getFirstSucceededRemoteData());
  }

  /**
   * Check if group has a linked object (community or collection linked to a workflow group)
   * @param group
   */
  hasLinkedDSO(group: Group): Observable<boolean> {
    return this.dSpaceObjectDataService.findByHref(group._links.object.href).pipe(
      getFirstSucceededRemoteData(),
      map((rd: RemoteData<DSpaceObject>) => hasValue(rd) && hasValue(rd.payload)),
      catchError(() => observableOf(false)),
    );
  }

  /**
   * Reset all input-fields to be empty and search all search
   */
  clearFormAndResetResult() {
    this.searchForm.patchValue({
      query: '',
    });
    this.search({ query: '' });
  }

  /**
   * Unsub all subscriptions
   */
  ngOnDestroy(): void {
    this.cleanupSubscribes();
    this.paginationService.clearPagination(this.config.id);
  }


  cleanupSubscribes() {
    if (hasValue(this.paginationSub)) {
      this.paginationSub.unsubscribe();
    }
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
    this.paginationService.clearPagination(this.config.id);
  }


  /**
   * Returns the type of the given group (lowercase).
   * @param group the group whose type to calculate
   */
  getGroupType(group: Group): string {
    const type = group.firstMetadataValue('perucris.group.type');
    if (!type) {
      return 'normal';
    }
    return type.toLowerCase();
  }

  /**
   * Returns true if the given group is enabled.
   * @param group the group to check
   */
  isEnabled(group: Group): boolean {
    const status = group.firstMetadataValue('perucris.group.status');
    return !status || status.toUpperCase() === 'ENABLED';
  }

  /**
   * Toggle the given group status.
   *
   * @param group the group to edit
   */
  toggleGroupStatus(group: Group) {
    const nextStatus: string = this.isEnabled(group) ? 'DISABLED' : 'ENABLED';
    const path = '/metadata/perucris.group.status';
    let operation: Operation = null;
    if ( group.hasMetadata('perucris.group.status')) {
      operation = {
        path: path,
        op: 'replace',
        value: nextStatus
      };
    } else {
      operation = {
        path: path,
        op: 'add',
        value: nextStatus
      };
    }

    this.groupService.patch(group, [operation])
      .pipe(first())
      .subscribe((response: any) => {
        if (response.isSuccessful) {
          const msg = this.translateService.get('admin.access-control.groups.notification.edit.success', { name: group.name });
          this.notificationsService.success( msg );
          this.groupService.clearGroupLinkRequests(group._links.subgroups.href);
          this.groupService.clearGroupLinkRequests(group._links.epersons.href);
        } else {
          const msg = this.translateService.get('admin.access-control.groups.notification.edit.failure', { name: group.name });
          this.notificationsService.error( msg );
        }
      });
  }

}
