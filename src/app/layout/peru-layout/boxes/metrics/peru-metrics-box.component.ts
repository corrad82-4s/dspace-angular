import { Component, ChangeDetectorRef } from '@angular/core';
import { CrisLayoutBox } from '../../../decorators/cris-layout-box.decorator';
import { LayoutTab } from '../../../enums/layout-tab.enum';
import { LayoutBox } from '../../../enums/layout-box.enum';
import { LayoutPage } from '../../../enums/layout-page.enum';
import { MetricsComponentsDataService } from '../../../../core/layout/metrics-components-data.service';
import { ItemDataService } from '../../../../core/data/item-data.service';
import { CrisLayoutMetricsBoxComponent } from '../../../default-layout/boxes/metrics/cris-layout-metrics-box.component';

/**
 * This component renders the metadata boxes of items
 */
@Component({
  selector: 'ds-peru-metrics-box',
  templateUrl: '../../../default-layout/boxes/metrics/cris-layout-metrics-box.component.html',
  styleUrls: ['../../../default-layout/boxes/metrics/cris-layout-metrics-box.component.scss']
})
/**
 * For overwrite this component create a new one that extends CrisLayoutBoxObj and
 * add the CrisLayoutBoxModelComponent decorator indicating the type of box to overwrite
 */
@CrisLayoutBox(LayoutPage.DEFAULT_PERU, LayoutTab.DEFAULT_PERU, LayoutBox.METRICS)
export class PeruMetricsBoxComponent extends CrisLayoutMetricsBoxComponent {

  constructor(
    public cd: ChangeDetectorRef,
    protected metricscomponentsService: MetricsComponentsDataService,
    protected itemService: ItemDataService
  ) {
    super(cd, metricscomponentsService, itemService);
  }
}
