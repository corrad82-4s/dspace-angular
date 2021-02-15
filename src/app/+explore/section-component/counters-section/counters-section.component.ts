import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { SearchObjects } from './../../../shared/search/search-objects.model';
import { getFirstSucceededRemoteDataPayload } from './../../../core/shared/operators';
import { PaginationComponentOptions } from './../../../shared/pagination/pagination-component-options.model';
import { SectionComponent } from './../../../core/layout/models/section.model';
import { BehaviorSubject } from 'rxjs';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { Component, Input, OnInit } from '@angular/core';
import { PaginatedSearchOptions } from 'src/app/shared/search/paginated-search-options.model';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'ds-counters-section',
  templateUrl: './counters-section.component.html'
})
export class CountersSectionComponent implements OnInit {

    @Input()
    sectionId: string;

    @Input()
    countersSection: CountersSection;

    counterData: CounterData[] = [];
    counterData$ = new BehaviorSubject(this.counterData);

    pagination: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
      id: 'counters-pagination',
      pageSize: 1,
      currentPage: 1
    });


  constructor(private searchService: SearchService) {

   }

  ngOnInit() {
    for (const counter of this.countersSection.counterSettingsList) {
      this.searchService.search(new PaginatedSearchOptions({
        configuration: counter.discoveryConfigurationName,
        pagination: this.pagination
      }))
      .pipe(
        getFirstSucceededRemoteDataPayload(),
        map((response: SearchObjects<DSpaceObject>) => response.totalElements)
      ).subscribe((total: number) => {
        this.counterData.push( {
          count: total.toString(),
          label: counter.entityName,
          icon: counter.icon,
          link: counter.link
        });
        this.counterData$.next(this.counterData);
      });
    }
  }
}

export interface CountersSection extends SectionComponent {
  componentType: 'counters';
  counterSettingsList: CountersSettings[];
}

export interface CountersSettings {
  discoveryConfigurationName: string;
  entityName: string;
  icon: string;
  link: string;
}

export interface CounterData {
  label: string;
  count: string;
  icon: string;
  link: string;
}
