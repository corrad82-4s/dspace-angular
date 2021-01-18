import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FacetSection } from 'src/app/core/layout/models/section.model';
import { getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { SearchFilterConfig } from 'src/app/shared/search/search-filter-config.model';
import { FilterType } from '../../../shared/search/filter-type.model';

/**
 * Component representing the Facet component section.
 */
@Component({
    selector: 'ds-facet-section',
    templateUrl: './facet-section.component.html'
})
export class FacetSectionComponent implements OnInit {

    @Input()
    sectionId: string;

    @Input()
    facetSection: FacetSection;

    discoveryConfiguration: string;

    facets: SearchFilterConfig[] = [];
    facets$ = new BehaviorSubject(this.facets);

    constructor(public searchService: SearchService) {

    }

    ngOnInit() {
      this.discoveryConfiguration = this.facetSection.discoveryConfigurationName;
      const chartTypes = [FilterType['chart.bar'], FilterType['chart.line'], FilterType['chart.pie']];
      this.searchService.searchFacets(null, this.discoveryConfiguration)
        .pipe( getFirstSucceededRemoteDataPayload() )
        .subscribe((facetConfigs) => {
          for (const config of facetConfigs) {
            if (config._embedded.values.length > 0 &&
              chartTypes.every((e) => e !== config.filterType)) {
              this.facets.push(config);
              this.facets$.next(this.facets);
            }
          }
        });
    }

    /**
     * Returns the queryParams for the search related to the given facet.
     *
     * @param facet the facet
     * @param value the facet value
     */
    getSearchQueryParams(facet: SearchFilterConfig, value: string) {
        const queryParams = {
            configuration: this.facetSection.discoveryConfigurationName,
            page: 1
        };
        if ( facet.filterType === FilterType.range) {
            const dates = value.split('-');
            if ( dates.length === 2) {
                queryParams[facet.paramName + '.min'] = dates[0].trim();
                queryParams[facet.paramName + '.max'] = dates[1].trim();
            } else {
                queryParams[facet.paramName] = dates[0].trim();
            }
        } else {
            queryParams[facet.paramName] = value;
        }
        return queryParams;
    }

}
