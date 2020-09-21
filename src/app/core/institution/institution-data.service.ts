import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaceOperation } from 'fast-json-patch';
import { Observable, combineLatest } from 'rxjs';
import { map, flatMap, catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { isNotEmpty } from 'src/app/shared/empty.util';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { createFailedRemoteDataObject$ } from 'src/app/shared/remote-data.utils';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { environment } from 'src/environments/environment';
import { RestResponse, ErrorResponse } from '../cache/response.models';
import { CommunityDataService } from '../data/community-data.service';
import { ConfigurationDataService } from '../data/configuration-data.service';
import { RemoteData } from '../data/remote-data';
import { PostRequest } from '../data/request.models';
import { RequestService } from '../data/request.service';
import { HttpOptions } from '../dspace-rest-v2/dspace-rest-v2.service';
import { Community } from '../shared/community.model';
import { configureRequest, getFirstSucceededRemoteDataPayload, getResponseFromEntry, getFinishedRemoteData, getRemoteDataPayload } from '../shared/operators';

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
        const hrefWithParent = `${href}?parent=${parentCommunity.id}`
        return new PostRequest(requestId, hrefWithParent, template.self, options);
      }),
      configureRequest(this.requestService)
    ).subscribe()

    return this.fetchCreateResponse(requestId).pipe(
      getFirstSucceededRemoteDataPayload(),
      flatMap((institution: Community) => this.patchInstitutionName(name, institution)),
      catchError((error: Error) => {
        this.notificationsService.error('Server Error:', error.message);
        return createFailedRemoteDataObject$() as Observable<RemoteData<Community>>
      })
    );
  }

  protected fetchCreateResponse(requestId: string): Observable<RemoteData<Community>> {
    // Resolve self link for new object
    const selfLink$ = this.requestService.getByUUID(requestId).pipe(
      getResponseFromEntry(),
      map((response: RestResponse) => {
        console.log('response', response);
        if (!response.isSuccessful && response instanceof ErrorResponse) {
          throw new Error(response.errorMessage);
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
    )
  }

  /**
   * Perform a patch operation to change the institution name
   * @param name
   * @param institution
   * @protected
   */
  protected patchInstitutionName(name: string, institution: Community): Observable<RemoteData<Community>> {
    const operation: ReplaceOperation<string> = {
      path: '/metadata/dc.title/0',
      op: 'replace',
      value: name
    };

    console.log('institution',institution);

    return this.communityDataService.patch(institution, [operation]).pipe(
      flatMap( () => this.communityDataService.findById(institution.id)),
      tap((x) => console.log('tap',x)),
      getFinishedRemoteData()
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
