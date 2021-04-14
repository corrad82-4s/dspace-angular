import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { CrisLayoutLoaderDirective } from './directives/cris-layout-loader.directive';
import { CrisPageLoaderComponent } from './cris-page-loader.component';
import { CrisLayoutDefaultComponent } from './default-layout/cris-layout-default.component';
import { CrisLayoutDefaultSidebarComponent } from './default-layout/sidebar/cris-layout-default-sidebar.component';
import { CrisLayoutDefaultTabComponent } from './default-layout/tab/cris-layout-default-tab.component';
import { CrisLayoutMetadataBoxComponent } from './default-layout/boxes/metadata/cris-layout-metadata-box.component';
import { RowComponent } from './default-layout/boxes/metadata/row/row.component';
import { TextComponent } from './default-layout/boxes/components/text/text.component';
import { HeadingComponent } from './default-layout/boxes/components/heading/heading.component';
import { CrisLayoutSearchBoxComponent } from './default-layout/boxes/search/cris-layout-search-box.component';
import { SearchPageModule } from '../+search-page/search-page.module';
import { MyDSpacePageModule } from '../+my-dspace-page/my-dspace-page.module';
import { LongtextComponent } from './default-layout/boxes/components/longtext/longtext.component';
import { DateComponent } from './default-layout/boxes/components/date/date.component';
import { DsDatePipe } from './pipes/ds-date.pipe';
import { LinkComponent } from './default-layout/boxes/components/link/link.component';
import { IdentifierComponent } from './default-layout/boxes/components/identifier/identifier.component';
import { CrisrefComponent } from './default-layout/boxes/components/crisref/crisref.component';
import { ThumbnailComponent } from './default-layout/boxes/components/thumbnail/thumbnail.component';
import { AttachmentComponent } from './default-layout/boxes/components/attachment/attachment.component';
import { OrcidSyncQueueComponent } from './custom-layout/orcid-sync-queue/orcid-sync-queue.component';
import { OrcidAuthorizationsComponent } from './custom-layout/orcid-authorizations/orcid-authorizations.component';
import { OrcidSyncSettingsComponent } from './custom-layout/orcid-sync-settings/orcid-sync-settings.component';
import { CrisLayoutMetricsBoxComponent } from './default-layout/boxes/metrics/cris-layout-metrics-box.component';
import { MetricRowComponent } from './default-layout/boxes/components/metric-row/metric-row.component';
import { ContextMenuModule } from '../shared/context-menu/context-menu.module';
import { MetricLoaderComponent } from './default-layout/boxes/components/metric/metric-loader/metric-loader.component';
import { MetricAltmetricComponent } from './default-layout/boxes/components/metric/metric-altmetric/metric-altmetric.component';
import { MetricDimensionsComponent } from './default-layout/boxes/components/metric/metric-dimensions/metric-dimensions.component';
import { MetricDspacecrisComponent } from './default-layout/boxes/components/metric/metric-dspacecris/metric-dspacecris.component';
import { MetricGooglescholarComponent } from './default-layout/boxes/components/metric/metric-googlescholar/metric-googlescholar.component';
import { TableComponent } from './default-layout/boxes/components/table/table.component';
import { InlineComponent } from './default-layout/boxes/components/inline/inline.component';
import { PeruLayoutComponent } from './peru-layout/peru-layout.component';
import { PeruTabComponent } from './peru-layout/peru-tab/peru-tab.component';
import { PeruMetadataBoxComponent } from './peru-layout/boxes/peru-metadata-box/peru-metadata-box.component';
import { PeruSearchBoxComponent } from './peru-layout/boxes/search/peru-search-box.component';
import { PeruMetricsBoxComponent } from './peru-layout/boxes/metrics/peru-metrics-box.component';
import { PeruSidebarComponent } from './peru-layout/peru-sidebar/peru-sidebar.component';
import { SourcesOfInformationComponent } from './peru-layout/sources-of-information/sources-of-information.component';
import { PendingCorrectionComponent } from './peru-layout/pending-corrections/pending-correction/pending-correction.component';
import { PendingCorrectionsComponent } from './peru-layout/pending-corrections/pending-corrections.component';
import { PendingCorrectionDetailsComponent } from './peru-layout/pending-corrections/pending-correction/pending-correction-details/pending-correction-details.component';

const ENTRY_COMPONENTS = [
  // put only entry components that use custom decorator
  CrisLayoutDefaultComponent,
  CrisLayoutDefaultTabComponent,
  CrisLayoutMetadataBoxComponent,
  CrisLayoutMetricsBoxComponent,
  CrisLayoutSearchBoxComponent,
  TextComponent,
  HeadingComponent,
  LongtextComponent,
  DateComponent,
  LinkComponent,
  IdentifierComponent,
  CrisrefComponent,
  ThumbnailComponent,
  AttachmentComponent,
  OrcidSyncSettingsComponent,
  OrcidSyncQueueComponent,
  OrcidAuthorizationsComponent,
  PeruLayoutComponent,
  PeruTabComponent,
  PeruMetadataBoxComponent,
  PeruSearchBoxComponent,
  PeruMetricsBoxComponent
];
@NgModule({
  declarations: [
    CrisLayoutLoaderDirective,
    CrisPageLoaderComponent,
    CrisLayoutDefaultSidebarComponent,
    CrisLayoutDefaultComponent,
    CrisLayoutDefaultTabComponent,
    CrisLayoutMetadataBoxComponent,
    CrisLayoutMetricsBoxComponent,
    RowComponent,
    TextComponent,
    HeadingComponent,
    CrisLayoutSearchBoxComponent,
    LongtextComponent,
    DateComponent,
    DsDatePipe,
    LinkComponent,
    IdentifierComponent,
    CrisrefComponent,
    ThumbnailComponent,
    AttachmentComponent,
    OrcidSyncSettingsComponent,
    OrcidSyncQueueComponent,
    OrcidAuthorizationsComponent,
    MetricRowComponent,
    MetricLoaderComponent,
    MetricAltmetricComponent,
    MetricDimensionsComponent,
    MetricDspacecrisComponent,
    MetricGooglescholarComponent,
    TableComponent,
    InlineComponent,
    PeruLayoutComponent,
    PeruTabComponent,
    PeruMetadataBoxComponent,
    PeruSearchBoxComponent,
    PeruMetricsBoxComponent,
    PendingCorrectionsComponent,
    PendingCorrectionComponent,
    PendingCorrectionDetailsComponent,
    SourcesOfInformationComponent,
    PeruSidebarComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    SearchPageModule,
    MyDSpacePageModule,
    ContextMenuModule
  ],
  exports: [
    CrisPageLoaderComponent,
    CrisLayoutDefaultComponent,
    CrisLayoutDefaultTabComponent,
    CrisLayoutMetadataBoxComponent
  ]
})
export class LayoutModule {
  /**
   * NOTE: this method allows to resolve issue with components that using a custom decorator
   * which are not loaded during CSR otherwise
   */
  static withEntryComponents() {
    return {
      ngModule: LayoutModule,
      providers: ENTRY_COMPONENTS.map((component) => ({provide: component}))
    };
  }
}
