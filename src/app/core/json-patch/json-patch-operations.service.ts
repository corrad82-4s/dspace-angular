import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { GlobalConfig } from '../../../config/global-config.interface';
import { hasValue, isEmpty, isNotEmpty, isNotUndefined, isUndefined } from '../../shared/empty.util';
import { ErrorResponse, PostPatchSuccessResponse, RestResponse } from '../cache/response-cache.models';
import { ResponseCacheEntry } from '../cache/response-cache.reducer';
import { ResponseCacheService } from '../cache/response-cache.service';
import { PatchRequest, RestRequest, SubmissionPatchRequest } from '../data/request.models';
import { RequestService } from '../data/request.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { CoreState } from '../core.reducers';
import { Store } from '@ngrx/store';
import { jsonPatchOperationsByResourceType } from './selectors';
import { JsonPatchOperationsResourceEntry } from './json-patch-operations.reducer';
import {
  CommitPatchOperationsAction,
  RollbacktPatchOperationsAction,
  StartTransactionPatchOperationsAction
} from './json-patch-operations.actions';
import { JsonPatchOperationModel } from './json-patch.model';
import { GLOBAL_CONFIG } from '../../../config';

@Injectable()
export class JsonPatchOperationsService<ResponseDefinitionDomain> extends HALEndpointService {
  protected linkPath;

  constructor(protected responseCache: ResponseCacheService,
              protected requestService: RequestService,
              @Inject(GLOBAL_CONFIG) protected EnvConfig: GlobalConfig,
              protected store: Store<CoreState>) {
    super();
  }

  protected submitData(request: RestRequest): Observable<ResponseDefinitionDomain> {
    const [successResponse, errorResponse] = this.responseCache.get(request.href)
      .map((entry: ResponseCacheEntry) => entry.response)
      .partition((response: RestResponse) => response.isSuccessful);
    return Observable.merge(
      errorResponse.flatMap((response: ErrorResponse) =>
        Observable.throw(new Error(`Couldn't send data to server`))),
      successResponse
        .filter((response: PostPatchSuccessResponse) => isNotEmpty(response))
        .map((response: PostPatchSuccessResponse) => response.dataDefinition)
        .distinctUntilChanged());
  }

  protected submitJsonPatchOperations(hrefObs: Observable<string>, resourceType: string, resourceId?: string) {
    let startTransactionTime = null;
    const [patchRequestObs, emptyRequestObs] = hrefObs
      .flatMap((endpointURL: string) => {
        return this.store.select(jsonPatchOperationsByResourceType(resourceType))
          .take(1)
          .filter((operationsList: JsonPatchOperationsResourceEntry) => isUndefined(operationsList) || !(operationsList.commitPending))
          .do(() => startTransactionTime = new Date().getTime())
          .map((operationsList: JsonPatchOperationsResourceEntry) => {
            const body: JsonPatchOperationModel[] = [];
            if (isNotEmpty(operationsList)) {
              if (isNotEmpty(resourceId)) {
                if (isNotUndefined(operationsList.children[resourceId]) && isNotEmpty(operationsList.children[resourceId].body)) {
                  operationsList.children[resourceId].body.forEach((entry) => {
                    body.push(entry.operation);
                  });
                }
              } else {
                Object.keys(operationsList.children)
                  .filter((key) => operationsList.children.hasOwnProperty(key))
                  .filter((key) => hasValue(operationsList.children[key]))
                  .filter((key) => hasValue(operationsList.children[key].body))
                  .forEach((key) => {
                    operationsList.children[key].body.forEach((entry) => {
                      body.push(entry.operation);
                    });
                  })
              }
            }
            return new SubmissionPatchRequest(this.requestService.generateRequestId(), endpointURL, body);
          });
      })
      .partition((request: PatchRequest) => isNotEmpty(request.body));

    return Observable.merge(
      emptyRequestObs
        .filter((request: PatchRequest) => isEmpty(request.body))
        .do(() => startTransactionTime = null)
        .map(() => null),
      patchRequestObs
        .filter((request: PatchRequest) => isNotEmpty(request.body))
        .do(() => this.store.dispatch(new StartTransactionPatchOperationsAction(resourceType, resourceId, startTransactionTime)))
        .do((request: PatchRequest) => this.requestService.configure(request, true))
        .flatMap((request: PatchRequest) => {
          const [successResponse, errorResponse] = this.responseCache.get(request.href)
            .filter((entry: ResponseCacheEntry) => startTransactionTime < entry.timeAdded)
            .take(1)
            .map((entry: ResponseCacheEntry) => entry.response)
            .partition((response: RestResponse) => response.isSuccessful);
          return Observable.merge(
            errorResponse
              .do(() => this.store.dispatch(new RollbacktPatchOperationsAction(resourceType, resourceId)))
              .flatMap((response: ErrorResponse) => Observable.of(new Error(`Couldn't patch operations`))),
            successResponse
              .filter((response: PostPatchSuccessResponse) => isNotEmpty(response))
              .do(() => this.store.dispatch(new CommitPatchOperationsAction(resourceType, resourceId)))
              .map((response: PostPatchSuccessResponse) => response.dataDefinition)
              .distinctUntilChanged());
        })
    );
  }

  protected getEndpointByIDHref(endpoint, resourceID): string {
    return isNotEmpty(resourceID) ? `${endpoint}/${resourceID}` : `${endpoint}`;
  }

  public jsonPatchByResourceType(linkName: string, scopeId: string, resourceType: string, ) {
    const hrefObs = this.getEndpoint(linkName)
      .filter((href: string) => isNotEmpty(href))
      .distinctUntilChanged()
      .map((endpointURL: string) => this.getEndpointByIDHref(endpointURL, scopeId));

    return this.submitJsonPatchOperations(hrefObs, resourceType);
  }

  public jsonPatchByResourceID(linkName: string, scopeId: string, resourceType: string, resourceId: string) {
    const hrefObs = this.getEndpoint(linkName)
      .filter((href: string) => isNotEmpty(href))
      .distinctUntilChanged()
      .map((endpointURL: string) => this.getEndpointByIDHref(endpointURL, scopeId));

    return this.submitJsonPatchOperations(hrefObs, resourceType, resourceId);
  }
}