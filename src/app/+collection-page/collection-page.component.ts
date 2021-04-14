import { hasSucceeded } from './../core/data/request.reducer';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject, combineLatest as observableCombineLatest, Observable, Subject } from 'rxjs';
import { filter, map, mergeMap, startWith, switchMap, take } from 'rxjs/operators';
import { PaginatedSearchOptions } from '../shared/search/paginated-search-options.model';
import { SearchService } from '../core/shared/search/search.service';
import { SortDirection, SortOptions } from '../core/cache/models/sort-options.model';
import { CollectionDataService } from '../core/data/collection-data.service';
import { PaginatedList } from '../core/data/paginated-list.model';
import { RemoteData } from '../core/data/remote-data';
import { MetadataService } from '../core/metadata/metadata.service';
import { Bitstream } from '../core/shared/bitstream.model';
import { Collection } from '../core/shared/collection.model';
import { DSpaceObjectType } from '../core/shared/dspace-object-type.model';
import { Item } from '../core/shared/item.model';
import {
  getAllSucceededRemoteDataPayload,
  getFirstSucceededRemoteData,
  redirectOn4xx,
  toDSpaceObjectListRD
} from '../core/shared/operators';
import { fadeIn, fadeInOut } from '../shared/animations/fade';
import { hasValue, isNotEmpty } from '../shared/empty.util';
import { PaginationComponentOptions } from '../shared/pagination/pagination-component-options.model';
import { AuthService } from '../core/auth/auth.service';
import { PaginationService } from '../core/pagination/pagination.service';
import { getCollectionPageRoute } from './collection-page-routing-paths';
import { getBulkImportRoute } from '../app-routing-paths';
import { AuthorizationDataService } from '../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../core/data/feature-authorization/feature-id';
import { ScriptDataService } from '../core/data/processes/script-data.service';
import { NotificationsService } from '../shared/notifications/notifications.service';
import { RequestEntry } from '../core/data/request.reducer';
import { ProcessParameter } from '../process-page/processes/process-parameter.model';
import { TranslateService } from '@ngx-translate/core';
import { RequestService } from '../core/data/request.service';
import { getCollectionEditRoute } from './collection-page-routing-paths';
import { Process } from '../process-page/processes/process.model';

@Component({
  selector: 'ds-collection-page',
  styleUrls: ['./collection-page.component.scss'],
  templateUrl: './collection-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeIn,
    fadeInOut
  ]
})
export class CollectionPageComponent implements OnInit {
  collectionRD$: Observable<RemoteData<Collection>>;
  itemRD$: Observable<RemoteData<PaginatedList<Item>>>;
  logoRD$: Observable<RemoteData<Bitstream>>;
  paginationConfig: PaginationComponentOptions;
  sortConfig: SortOptions;
  private paginationChanges$: Subject<{
    paginationConfig: PaginationComponentOptions,
    sortConfig: SortOptions
  }>;

  /**
   * Whether the current user is a Community admin
   */
  isCollectionAdmin$: Observable<boolean>;

  /**
   * Route to the community page
   */
  collectionPageRoute$: Observable<string>;

  constructor(
    private collectionDataService: CollectionDataService,
    private searchService: SearchService,
    private metadata: MetadataService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private paginationService: PaginationService
    private authService: AuthService,
    private authorizationService: AuthorizationDataService,
    private scriptService: ScriptDataService,
    private translationService: TranslateService,
    private requestService: RequestService,
    private notificationsService: NotificationsService
  ) {
    this.paginationConfig = new PaginationComponentOptions();
    this.paginationConfig.id = 'cp';
    this.paginationConfig.pageSize = 5;
    this.paginationConfig.currentPage = 1;
    this.sortConfig = new SortOptions('dc.date.accessioned', SortDirection.DESC);
  }

  ngOnInit(): void {
    this.collectionRD$ = this.route.data.pipe(
      map((data) => data.dso as RemoteData<Collection>),
      redirectOn4xx(this.router, this.authService),
      take(1)
    );
    this.logoRD$ = this.collectionRD$.pipe(
      map((rd: RemoteData<Collection>) => rd.payload),
      filter((collection: Collection) => hasValue(collection)),
      mergeMap((collection: Collection) => collection.logo)
    );

    this.paginationChanges$ = new BehaviorSubject({
      paginationConfig: this.paginationConfig,
      sortConfig: this.sortConfig
    });

    const currentPagination$ = this.paginationService.getCurrentPagination(this.paginationConfig.id, this.paginationConfig);
    const currentSort$ = this.paginationService.getCurrentSort(this.paginationConfig.id, this.sortConfig);

    this.itemRD$ = observableCombineLatest([currentPagination$, currentSort$]).pipe(
      switchMap(([currentPagination, currentSort ]) => this.collectionRD$.pipe(
        getFirstSucceededRemoteData(),
        map((rd) => rd.payload.id),
        switchMap((id: string) => {
          return this.searchService.search(
              new PaginatedSearchOptions({
                scope: id,
                pagination: currentPagination,
                sort: currentSort,
                dsoTypes: [DSpaceObjectType.ITEM]
              })).pipe(toDSpaceObjectListRD()) as Observable<RemoteData<PaginatedList<Item>>>;
        }),
        startWith(undefined) // Make sure switching pages shows loading component
        )
      )
    );

    this.collectionPageRoute$ = this.collectionRD$.pipe(
      getAllSucceededRemoteDataPayload(),
      map((collection) => getCollectionPageRoute(collection.id))
    );

    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      this.metadata.processRemoteData(this.collectionRD$);
    });
  }

  isNotEmpty(object: any) {
    return isNotEmpty(object);
  }

  ngOnDestroy(): void {
    this.paginationService.clearPagination(this.paginationConfig.id);
  }

  exportCollection(collection: Collection) {

    const stringParameters: ProcessParameter[] = [
      { name: '-c', value: collection.id }
    ];

    this.scriptService.invoke('collection-export', stringParameters, [])
      .pipe(take(1))
      .subscribe((requestEntry: RemoteData<Process>) => {
        if (requestEntry.isSuccess) {
          this.notificationsService.success(this.translationService.get('collection-export.success'));
          this.navigateToProcesses();
        } else {
          this.notificationsService.error(this.translationService.get('collection-export.error'));
        }
      });
  }

  private navigateToProcesses() {
    this.requestService.removeByHrefSubstring('/processes');
    this.router.navigateByUrl('/processes');
  }

  getBulkImportPageRouterLink(collection: Collection) {
    return getBulkImportRoute(collection);
  }

  getCollectionEditPageRouterLink(collection: Collection) {
    return getCollectionEditRoute(collection.uuid);
  }

  isCollectionAdmin(collection: Collection): Observable<boolean> {
    return this.authorizationService.isAuthorized(FeatureID.AdministratorOf, collection.self, undefined);
  }
}
