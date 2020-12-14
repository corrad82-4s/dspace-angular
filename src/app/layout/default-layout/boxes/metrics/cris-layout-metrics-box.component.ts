import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CrisLayoutBox as CrisLayoutBoxObj } from 'src/app/layout/models/cris-layout-box.model';
import { CrisLayoutBox } from 'src/app/layout/decorators/cris-layout-box.decorator';
import { LayoutTab } from 'src/app/layout/enums/layout-tab.enum';
import { LayoutBox } from 'src/app/layout/enums/layout-box.enum';
import { LayoutPage } from 'src/app/layout/enums/layout-page.enum';
import { getAllSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { Subscription } from 'rxjs';
import { hasValue } from 'src/app/shared/empty.util';
import { MetricsComponent } from "../../../../core/layout/models/metrics-component.model";
import { MetricsComponentsDataService } from "../../../../core/layout/metrics-components-data.service";
import { Metric } from "../../../../core/shared/metric.model";

export interface MetricRow {
  metrics: Metric[];
}

/**
 * This component renders the metadata boxes of items
 */
@Component({
  selector: 'ds-cris-layout-metrics-box',
  templateUrl: './cris-layout-metrics-box.component.html',
  styleUrls: ['./cris-layout-metrics-box.component.scss']
})
/**
 * For overwrite this component create a new one that extends CrisLayoutBoxObj and
 * add the CrisLayoutBox decorator indicating the type of box to overwrite
 */
@CrisLayoutBox(LayoutPage.DEFAULT, LayoutTab.DEFAULT, LayoutBox.METRICS)
export class CrisLayoutMetricsBoxComponent extends CrisLayoutBoxObj implements OnInit, OnDestroy {

  /**
   * Contains the fields configuration for current box
   */
  metricscomponents: MetricsComponent;

  /**
   * Computed metric rows for the item and the current box
   */
  metricRows: MetricRow[];

  /**
   * true if the item has a thumbnail, false otherwise
   */
  hasThumbnail = false;

  /**
   * List of subscriptions
   */
  subs: Subscription[] = [];

  constructor(
    public cd: ChangeDetectorRef,
    private metricscomponentsService: MetricsComponentsDataService
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    this.subs.push(this.metricscomponentsService.findById(this.box.id)
      .pipe(getAllSucceededRemoteDataPayload())
      .subscribe(
        (next) => {
          this.metricscomponents = next;
          this.metricRows = this.metricscomponentsService
            .getMatchingMetrics(this.item, this.box.maxColumns, this.metricscomponents.metrics);
          this.cd.markForCheck();
        }
      ));
  }

  /**
   * Unsubscribes all subscriptions
   */
  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }
}
