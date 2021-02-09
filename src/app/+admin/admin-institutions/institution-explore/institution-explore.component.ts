import { PaginationComponentOptions } from '../../../shared/pagination/pagination-component-options.model';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { getCollectionPageRoute } from '../../../+collection-page/collection-page-routing-paths';
import { getCommunityPageRoute } from '../../../+community-page/community-page-routing-paths';
import { SortDirection, SortOptions } from '../../../core/cache/models/sort-options.model';
import { CollectionDataService } from '../../../core/data/collection-data.service';
import { RequestService } from '../../../core/data/request.service';
import { InstitutionDataService } from '../../../core/institution/institution-data.service';
import { Collection } from '../../../core/shared/collection.model';
import { Community } from '../../../core/shared/community.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { MetadataValue } from '../../../core/shared/metadata.models';
import { getFirstSucceededRemoteDataWithNotEmptyPayload, getFirstSucceededRemoteListPayload } from '../../../core/shared/operators';
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
    combineLatest(
      this.institutionService.findAll({ currentPage: this.config.currentPage,
        elementsPerPage: this.config.pageSize,
        sort: { field: this.sortConfig.field, direction: this.sortConfig.direction }}).pipe(getFirstSucceededRemoteDataWithNotEmptyPayload()),
      this.institutionService.getInstitutionTemplate()
    ).subscribe(([institutions, template]) => {

      this.requestService.removeByHrefSubstring(institutions.self);
      if (!template || this.templateIncludedInInstitutions(institutions.page, template)) {
        this.institutions$.next(institutions.page);
      } else {
        this.institutions$.next([template, ...institutions.page]);
      }

    });
  }

  private templateIncludedInInstitutions(institutions: Community[], template: Community): boolean {
    return institutions.map((community) => community.id).includes(template.id);
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
    };
  }

}
