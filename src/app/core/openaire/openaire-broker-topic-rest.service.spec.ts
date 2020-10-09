import { HttpClient } from '@angular/common/http';

import { TestScheduler } from 'rxjs/testing';
import { of as observableOf } from 'rxjs';
import { getTestScheduler, cold, hot } from 'jasmine-marbles';

import { RequestService } from '../data/request.service';
import { PaginatedList } from '../data/paginated-list';
import { RequestEntry } from '../data/request.reducer';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { RestResponse } from '../cache/response.models';
import { PageInfo } from '../shared/page-info.model';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject } from '../../shared/remote-data.utils';
import { OpenaireBrokerTopicRestService } from './openaire-broker-topic-rest.service';
import { openaireBrokerTopicObjectMorePid, openaireBrokerTopicObjectMoreAbstract } from '../../shared/mocks/openaire.mock';

describe('OpenaireBrokerTopicRestService', () => {
  let scheduler: TestScheduler;
  let service: OpenaireBrokerTopicRestService;
  let responseCacheEntry: RequestEntry;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;
  let http: HttpClient;
  let comparator: any;

  const endpointURL = 'https://rest.api/rest/api/integration/nbtopics';
  const requestUUID = '8b3c913a-5a4b-438b-9181-be1a5b4a1c8a';

  const pageInfo = new PageInfo();
  const array = [ openaireBrokerTopicObjectMorePid, openaireBrokerTopicObjectMoreAbstract ];
  const paginatedList = new PaginatedList(pageInfo, array);
  const brokerTopicObjectRD = createSuccessfulRemoteDataObject(openaireBrokerTopicObjectMorePid);
  const paginatedListRD = createSuccessfulRemoteDataObject(paginatedList);

  beforeEach(() => {
    scheduler = getTestScheduler();

    responseCacheEntry = new RequestEntry();
    responseCacheEntry.response = new RestResponse(true, 200, 'Success');
    requestService = jasmine.createSpyObj('requestService', {
      generateRequestId: requestUUID,
      configure: true,
      removeByHrefSubstring: {},
      getByHref: observableOf(responseCacheEntry),
      getByUUID: observableOf(responseCacheEntry),
    });

    rdbService = jasmine.createSpyObj('rdbService', {
      buildSingle: cold('(a)', {
        a: brokerTopicObjectRD
      }),
      buildList: cold('(a)', {
        a: paginatedListRD
      }),
    });

    objectCache = {} as ObjectCacheService;
    halService = jasmine.createSpyObj('halService', {
       getEndpoint: cold('a|', { a: endpointURL })
    });

    notificationsService = {} as NotificationsService;
    http = {} as HttpClient;
    comparator = {} as any;

    service = new OpenaireBrokerTopicRestService(
      requestService,
      rdbService,
      objectCache,
      halService,
      notificationsService,
      http,
      comparator
    );

    spyOn((service as any).dataService, 'findAllByHref').and.callThrough();
    spyOn((service as any).dataService, 'findByHref').and.callThrough();
  });

  describe('getTopics', () => {
    it('should proxy the call to dataservice.findAllByHref', () => {
      service.getTopics().subscribe(
        (res) => {
          expect((service as any).dataService.findAllByHref).toHaveBeenCalledWith(endpointURL, {});
        }
      );
    });

    it('should return a RemoteData<PaginatedList<OpenaireBrokerTopicObject>> for the object with the given URL', () => {
      const result = service.getTopics();
      const expected = cold('(a)', {
        a: paginatedListRD
      });
      expect(result).toBeObservable(expected);
    });
  });

  describe('getTopic', () => {
    it('should proxy the call to dataservice.findByHref', () => {
      service.getTopic(openaireBrokerTopicObjectMorePid.id).subscribe(
        (res) => {
          expect((service as any).dataService.findByHref).toHaveBeenCalledWith(endpointURL + '/' + openaireBrokerTopicObjectMorePid.id);
        }
      );
    });

    it('should return a RemoteData<OpenaireBrokerTopicObject> for the object with the given URL', () => {
      const result = service.getTopic(openaireBrokerTopicObjectMorePid.id);
      const expected = cold('(a)', {
        a: brokerTopicObjectRD
      });
      expect(result).toBeObservable(expected);
    });
  });

});