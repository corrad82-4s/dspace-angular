import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getCollectionPageRoute } from 'src/app/+collection-page/collection-page-routing-paths';
import { getCommunityPageRoute } from 'src/app/+community-page/community-page-routing-paths';
import { getAdminModuleRoute } from 'src/app/app-routing-paths';
import { SortDirection, SortOptions } from 'src/app/core/cache/models/sort-options.model';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { RequestService } from 'src/app/core/data/request.service';
import { InstitutionDataService } from 'src/app/core/institution/institution-data.service';
import { Collection } from 'src/app/core/shared/collection.model';
import { Community } from 'src/app/core/shared/community.model';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { MetadataValue } from 'src/app/core/shared/metadata.models';
import { getFirstSucceededRemoteDataWithNotEmptyPayload, getFirstSucceededRemoteListPayload } from 'src/app/core/shared/operators';
import { PaginationComponentOptions } from 'src/app/shared/pagination/pagination-component-options.model';
import { getGroupEditRoute } from '../../admin-access-control/admin-access-control-routing-paths';

/**
 * A component that provides a summary of the institutional space.
 */
@Component({
  selector: 'ds-institution-explore',
  templateUrl: './institution-explore.component.html',
  styleUrls : ['./institution-explore.component.scss']
})
export class InstitutionExploreComponent implements OnInit {

  /**
   * The pagination configuration
   */
  config: PaginationComponentOptions;

  /**
   * The pagination id
   */
  pageId = 'institution-explore-pagination';

  /**
   * The sorting configuration
   */
  sortConfig: SortOptions;

  currentInstitution: Community;

  /**
   * A list of institutions.
   */
  institutions$: BehaviorSubject<Community[]> = new BehaviorSubject<Community[]>([]);

  constructor(
    private institutionService: InstitutionDataService,
    private collectionService: CollectionDataService,
    private requestService: RequestService) {

    }

  ngOnInit(): void {
    this.config = new PaginationComponentOptions();
    this.config.id = this.pageId;
    this.config.pageSize = 100;
    this.config.currentPage = 0;
    this.sortConfig = new SortOptions('dc.title', SortDirection.ASC);
    this.updatePage();
  }

  /**
   * Update the list of institutions.
   */
  updatePage() {
    this.institutionService.findAll({
      currentPage: this.config.currentPage,
      elementsPerPage: this.config.pageSize,
      sort: { field: this.sortConfig.field, direction: this.sortConfig.direction }
    }).pipe(getFirstSucceededRemoteDataWithNotEmptyPayload()).subscribe((results) => {
      this.requestService.removeByHrefSubstring(results.self)
      this.institutions$.next(results.page);
    });
  }

  changeCurrentInstitution(institution: Community) {
    this.currentInstitution = institution;
  }

  getCurrentInstitutionalScopedRoles(): MetadataValue[] {
    return this.currentInstitution.allMetadata('perucris.community.institutional-scoped-role');
  }

  getCurrentInstitutionEntities$(): Observable<Collection[]> {
    return this.collectionService.findByParent(this.currentInstitution.id, {
      currentPage: this.config.currentPage,
      elementsPerPage: this.config.pageSize,
      sort: { field: this.sortConfig.field, direction: this.sortConfig.direction }
    }).pipe(getFirstSucceededRemoteListPayload());
  }

  getName(object: DSpaceObject) {
    return object.firstMetadataValue('dc.title');
  }

  getCurrentCommunityPath(): string {
    return getCommunityPageRoute(this.currentInstitution.id);
  }

  getCollectionPath(collection: Collection): string {
    return getCollectionPageRoute(collection.id);
  }

  getGroupPath(scopedRole: MetadataValue): string {
    return getGroupEditRoute(scopedRole.authority);
  }

  getInstitutionLinkClass(institution: Community) {
    return {
      'nav-link' : true,
      'lead' : true,
      'active' : this.currentInstitution && this.currentInstitution.id === institution.id
    }
  }

}
