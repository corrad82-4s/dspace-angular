import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { catchError, distinctUntilChanged, flatMap, map, switchMap } from 'rxjs/operators';
import { isNotEmpty } from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { createFailedRemoteDataObject$ } from '../../shared/remote-data.utils';
import { ErrorResponse, RestResponse } from '../cache/response.models';
import { CommunityDataService } from '../data/community-data.service';
import { ConfigurationDataService } from '../data/configuration-data.service';
import { PaginatedList } from '../data/paginated-list.model';
import { RemoteData } from '../data/remote-data';
import { FindListOptions, PostRequest } from '../data/request.models';
import { RequestService } from '../data/request.service';
import { HttpOptions } from '../dspace-rest/dspace-rest.service';
import { Community } from '../shared/community.model';
import { configureRequest, getFinishedRemoteData, getFirstSucceededRemoteDataPayload, getRemoteDataPayload, getResponseFromEntry } from '../shared/operators';

/**
 * Service to handle institutions.
 */
@Injectable()
export class InstitutionDataService {

  constructor(
    private communityDataService: CommunityDataService,
    private requestService: RequestService,
    private notificationsService: NotificationsService,
    private configurationService: ConfigurationDataService) {

  }

  /**
   * Create a new institution from institution template
   *
   * @param name the institution name
   * @return Observable<RemoteData<Community>> The institution created
   */
  createInstitution(name: string): Observable<RemoteData<Community>> {

    const requestId = this.requestService.generateRequestId();
    const options: HttpOptions = Object.create({});
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'text/uri-list');
    options.headers = headers;
    const template$ = this.getInstitutionTemplate();
    const parentCommunity$ = this.getInstitutionsCommunity();
    const href$ = this.communityDataService.getEndpoint();
    combineLatest([template$, href$, parentCommunity$]).pipe(
      map(([template, href, parentCommunity]: [Community, string, Community]) => {
        const hrefWithParentAndName = `${href}?parent=${parentCommunity.id}&name=${name}`;
        return new PostRequest(requestId, hrefWithParentAndName, template.self, options);
      }),
      configureRequest(this.requestService)
    ).subscribe();

    return this.fetchCreateResponse(requestId).pipe(
      getFinishedRemoteData(),
      catchError((error: Error) => createFailedRemoteDataObject$() as Observable<RemoteData<Community>>)
    );
  }

  findAll(options: FindListOptions): Observable<RemoteData<PaginatedList<Community>>> {
    return this.getInstitutionsCommunity().pipe(
      flatMap((parentCommunity) => this.communityDataService.findByParent(parentCommunity.id, options))
    );
  }

  protected fetchCreateResponse(requestId: string): Observable<RemoteData<Community>> {
    // Resolve self link for new object
    const selfLink$ = this.requestService.getByUUID(requestId).pipe(
      getResponseFromEntry(),
      map((response: RestResponse) => {
        if (!response.isSuccessful ) {
          throw new Error((response as any).errorMessage);
        } else {
          return response;
        }
      }),
      map((response: any) => {
        if (isNotEmpty(response.resourceSelfLinks)) {
          return response.resourceSelfLinks[0];
        }
      }),
      distinctUntilChanged()
    ) as Observable<string>;

    return selfLink$.pipe(
      switchMap((selfLink: string) => this.communityDataService.findByHref(selfLink)),
    );
  }

  /**
   * Get the first institution template available.
   *
   * @return Observable<Community>
   */
  getInstitutionTemplate(): Observable<Community> {
    return this.getConfigurationProperty('institution.template-id').pipe(
      switchMap((templateId) => this.communityDataService.findById(templateId)),
      getFinishedRemoteData(),
      getRemoteDataPayload()
    );
  }

  /**
   * Get community that contains all institutions.
   *
   * @return Observable<Community>
   */
  getInstitutionsCommunity(): Observable<Community> {
    return this.getConfigurationProperty('institution.parent-community-id').pipe(
      switchMap((parentCommunityId) => this.communityDataService.findById(parentCommunityId)),
      getFinishedRemoteData(),
      getRemoteDataPayload()
    );
  }

  private getConfigurationProperty(propertyName: string): Observable<string> {
    return this.configurationService.findByPropertyName(propertyName).pipe(
      getFirstSucceededRemoteDataPayload(),
      map((configurationProperty) => configurationProperty.values[0])
    );
  }
}
