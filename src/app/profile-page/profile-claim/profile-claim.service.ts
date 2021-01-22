import { getFirstSucceededRemoteData, getFirstSucceededRemoteDataPayload } from './../../core/shared/operators';
import {Injectable} from '@angular/core';
import {SearchService} from '../../core/shared/search/search.service';
import {EPerson} from '../../core/eperson/models/eperson.model';
import {hasValue} from '../../shared/empty.util';
import {PaginatedSearchOptions} from '../../shared/search/paginated-search-options.model';
import {mergeMap, take} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {RemoteData} from '../../core/data/remote-data';
import {PaginatedList} from '../../core/data/paginated-list.model';
import {SearchResult} from '../../shared/search/search-result.model';
import {DSpaceObject} from '../../core/shared/dspace-object.model';

@Injectable()
export class ProfileClaimService {

  constructor(private searchService: SearchService) {
  }

  canClaimProfiles(eperson: EPerson): Observable<boolean> {

    const query = this.personQueryData(eperson);

    if (!hasValue(query) || query.length === 0) {
      return of(false);
    }
    return this.lookup(query).pipe(
      mergeMap((rd: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>) => of(rd.payload.totalElements > 0))
    );
  }

  search(eperson: EPerson): Observable<RemoteData<PaginatedList<SearchResult<DSpaceObject>>>> {
    const query = this.personQueryData(eperson);
    if (!hasValue(query) || query.length === 0) {
      return of(null);
    }
    return this.lookup(query);
  }

  private lookup(query: string): Observable<RemoteData<PaginatedList<SearchResult<DSpaceObject>>>> {
    if (!hasValue(query)) {
      return of(null);
    }
    return this.searchService.search(new PaginatedSearchOptions({
      configuration: 'eperson_claims',
      query: query
    }))
    .pipe(
      getFirstSucceededRemoteData(),
      take(1));
  }

  private personQueryData(eperson: EPerson) {
    const query = [];
    this.queryParam(query, 'perucris.identifier.dni', eperson.dni());
    this.queryParam(query, 'person.identifier.orcid', eperson.orcidId());
    return query.join(' OR ');
  }

  private queryParam(query: string[], metadata: string, value: string) {
    if (!hasValue(value)) {return;}
    query.push(metadata + ':' + value);
  }
}
