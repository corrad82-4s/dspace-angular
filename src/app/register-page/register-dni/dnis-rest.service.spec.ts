import { TestScheduler } from 'rxjs/testing';
import { getTestScheduler } from 'jasmine-marbles';

import { getMockRequestService } from '../../shared/mocks/request.service.mock';
import { getMockRemoteDataBuildService } from '../../shared/mocks/remote-data-build.service.mock';
import { DnisRestService } from './dnis-rest.service';
import { RequestService } from '../../core/data/request.service';
import { RemoteDataBuildService } from '../../core/cache/builders/remote-data-build.service';
import { GetRequest } from '../../core/data/request.models';
import { of as observableOf } from 'rxjs';

describe('DnisRestService test suite', () => {
  let scheduler: TestScheduler;
  let service: DnisRestService;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let halService: any;

  const resourceEndpointURL = 'https://rest.api/endpoint';
  const dni = 'dni';
  const date = 'date';
  const resourceHref = resourceEndpointURL + '/dnis' + '/' + dni + ':' + date;
  const mockHalService = {
    getEndpoint: (linkPath) => observableOf(resourceEndpointURL)
  };

  function initTestService() {
    return new DnisRestService(
      rdbService,
      requestService,
      halService
    );
  }

  beforeEach(() => {
    requestService = getMockRequestService();
    rdbService = getMockRemoteDataBuildService();
    scheduler = getTestScheduler();
    halService = mockHalService;
    service = initTestService();

  });

  describe('verifyDni', () => {
    it('should configure a new GetRequest', () => {
      const expected = new GetRequest(requestService.generateRequestId(), resourceHref);
      scheduler.schedule(() => service.verifyDni(dni, date).subscribe());
      scheduler.flush();

      expect(requestService.configure).toHaveBeenCalledWith(expected);
    });
  });


});
