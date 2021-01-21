import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';
import { RequestService } from '../data/request.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { Store } from '@ngrx/store';
import { CoreState } from '../core.reducers';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { HttpClient } from '@angular/common/http';
import { ChangeAnalyzer } from '../data/change-analyzer';
import { dataService } from '../cache/builders/build-decorators';
import { DefaultChangeAnalyzer } from '../data/default-change-analyzer.service';
import { Observable } from 'rxjs';
import { RemoteData } from '../data/remote-data';
import { METRICSCOMPONENT } from './models/metrics-component.resource-type';
import { MetricsComponent } from './models/metrics-component.model';
import { Metric } from '../shared/metric.model';
import { MetricRow } from '../../layout/default-layout/boxes/metrics/cris-layout-metrics-box.component';

/* tslint:disable:max-classes-per-file */
class DataServiceImpl extends DataService<MetricsComponent> {
  protected linkPath = 'boxmetricsconfigurations';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: ChangeAnalyzer<MetricsComponent>) {
    super();
  }
}

/**
 * A service responsible for fetching data from the REST API on the metadatacomponents endpoint
 */
@Injectable()
@dataService(METRICSCOMPONENT)
export class MetricsComponentsDataService {

  private dataService: DataServiceImpl;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<MetricsComponent>) {
    this.dataService = new DataServiceImpl(requestService, rdbService, null,
      objectCache, halService, notificationsService, http, comparator);
  }

  /**
   * It provides the configuration for a box that visualize a list of
   * metrics according to specific rules
   * @param boxId id of box
   */
  findById(boxId: number): Observable<RemoteData<MetricsComponent>> {
    return this.dataService.findById(boxId.toString());
  }

  /**
   * Get matching metrics for item.
   */
  getMatchingMetrics(metrics: Metric[], maxColumn: number, metricTypes: string[]): MetricRow[] {

    // metrics = []
    //
    // metrics.push({...metricMock, metricType: 'views', metricCount: 111});
    // metrics.push({...metricMock, metricType: 'downloads', metricCount: 222});
    // metrics.push({...metricMock, metricType: 'metric1', metricCount: 333});
    // metrics.push({...metricMock, metricType: 'altmetric', remark: altMetricExample});
    // metrics.push({...metricMock, metricType: 'googleScholar', remark: googleExample});
    // metrics.push({...metricMock, metricType: 'metric5', metricCount: 777});
    //
    // metricTypes = ['views', 'downloads', 'metric1', 'altmetric', 'googleScholar'];

    const metricRows = this.computeMetricsRows(metrics, 3, metricTypes);

    return metricRows;
  }

  computeMetricsRows(itemMetrics: Metric[], maxColumn, metricTypes: string[]): MetricRow[] {

    // support
    const typeMap = {};
    metricTypes.forEach((type) => typeMap[type] = type);

    // filter, enrich, order
    const metrics = itemMetrics
      .filter((metric) => typeMap[metric.metricType])
      .map((metric) => {
        return { ...metric, position: typeMap[metric.metricType].position };
      })
      .sort((metric) => metric.position);

    // chunker
    const totalRow = Math.ceil(metrics.length / maxColumn);
    const metricRows = [];
    for (let row = 0; row < totalRow; row++) {
      const metricsInRow = [];
      for (let j = 0; j < maxColumn; j++) {
        const i = row * maxColumn + j;
        metricsInRow.push(i < metrics.length ? metrics[i] : null);
      }
      metricRows.push({ metrics: metricsInRow });
    }

    // final result
    return metricRows;

  }

}

const metricMock = {
  acquisitionDate: new Date(),
  deltaPeriod1: null,
  deltaPeriod2: null,
  endDate: null,
  id: '1',
  last: true,
  metricCount: 333,
  metricType: 'views',
  rank: null,
  remark: null,
  startDate: null,
  type: null,
  _links: null
};

const googleExample = '<a target="_blank" title="" \n' +
  'href="https://scholar.google.com/scholar?as_q=&amp;as_epq=A strong regioregularity effect in self-organizing conjugated polymer films and high-efficiency polythiophene: fullerene solar cells&amp;as_occt=any"\n' +
  ' >Check</a>';

const altMetricExample = '<div class=\'altmetric-embed\' data-badge-popover=\'bottom\' data-badge-type=\'donut\' data-doi="10.1038/nature.2012.9872"></div>';
