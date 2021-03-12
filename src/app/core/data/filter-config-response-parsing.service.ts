import { SimpleSearchFilterConfig } from './../../shared/search/simple-search-filter-config.model';
import { Injectable } from '@angular/core';
import { SearchFilterConfig } from '../../shared/search/search-filter-config.model';
import { ParsedResponse } from '../cache/response.models';
import { RawRestResponse } from '../dspace-rest/raw-rest-response.model';
import { DSpaceSerializer } from '../dspace-rest/dspace.serializer';
import { RestRequest } from './request.models';
import { DspaceRestResponseParsingService } from './dspace-rest-response-parsing.service';
import { FacetConfigResponse } from '../../shared/search/facet-config-response.model';

@Injectable()
export class FilterConfigResponseParsingService extends DspaceRestResponseParsingService {
  parse(request: RestRequest, data: RawRestResponse): ParsedResponse {

    const config = data.payload.filters;
    const serializer = new DSpaceSerializer(SimpleSearchFilterConfig);
    const filters = serializer.deserializeArray(config);

    const _links = {
      self: data.payload._links.self
    };

    const facetConfigResponse = Object.assign(new FacetConfigResponse(), {
      filters,
      _links
    });

    this.addToObjectCache(facetConfigResponse, request, data);

    return new ParsedResponse(data.statusCode, facetConfigResponse._links.self);
  }
}
