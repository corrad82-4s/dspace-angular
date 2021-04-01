import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, tap, map, mergeMap } from 'rxjs/operators';
import { RemoteDataBuildService } from '../../core/cache/builders/remote-data-build.service';
import { RequestService } from '../../core/data/request.service';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { NoContent } from '../../core/shared/NoContent.model';
import { isNotEmpty } from '../../shared/empty.util';
import { GetRequest, RestRequest } from '../../core/data/request.models';
import { RestResponse } from '../../core/cache/response.models';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { RemoteData } from '../../core/data/remote-data';

/**
 * The service handling all submission REST requests
 */
@Injectable({ providedIn: 'root'})
export class DnisRestService {
  protected linkPath = 'dnis';

  constructor(
    protected rdbService: RemoteDataBuildService,
    protected requestService: RequestService,
    protected halService: HALEndpointService) {
  }

  /**
   * Fetch a RestRequest
   *
   * @param requestId
   *    The base endpoint for the type of object
   * @return Observable<RemoteData<RestResponse>>
   *     server response
   */
  protected fetchRequest(requestId: string): Observable<RemoteData<RestResponse>> {
    return this.rdbService.buildFromRequestUUID<RestResponse>(requestId).pipe(
      getFirstCompletedRemoteData(),
      distinctUntilChanged()
    );
  }

  /**
   * Return an existing submission Object from the server
   *
   * @param linkName
   *    The endpoint link name
   * @param id
   *    The submission Object to retrieve
   * @return Observable<SubmitDataResponseDefinitionObject>
   *     server response
   */
  public verifyDni(dni: string, date: string): Observable<RemoteData<NoContent>> {
    const requestId = this.requestService.generateRequestId();
    return this.halService.getEndpoint(this.linkPath).pipe(
      filter((href: string) => isNotEmpty(href)),
      distinctUntilChanged(),
      map((endpointURL: string) => {
        return new GetRequest(requestId, endpointURL + '/' + this.linkPath + '/' + dni + ':' + date);
      }),
      tap((request: RestRequest) => {
        this.requestService.removeByHrefSubstring(request.href);
        this.requestService.configure(request);
      }),
      mergeMap(() => this.fetchRequest(requestId)),
      distinctUntilChanged());
  }

}
