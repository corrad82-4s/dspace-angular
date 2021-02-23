import { Component, Input } from '@angular/core';
import { CrisLayoutDefaultSidebarComponent } from '../../default-layout/sidebar/cris-layout-default-sidebar.component';
import { Location } from '@angular/common';
import { Tab } from '../../../core/layout/models/tab.model';

@Component({
  selector: 'ds-peru-sidebar',
  templateUrl: './peru-sidebar.component.html',
  styleUrls: ['./peru-sidebar.component.scss']
})
export class PeruSidebarComponent extends CrisLayoutDefaultSidebarComponent {

  /**
   * tabs list
   */
  @Input() shadowCopyTabs: Tab[];

  constructor(protected location: Location) {
    super(location);
  }

  isShadowedContentEmpty(tab: Tab): boolean {
    return this.shadowCopyTabs && this.shadowCopyTabs.filter((st) => st.shortname === tab.shortname).length === 0;
  }

}