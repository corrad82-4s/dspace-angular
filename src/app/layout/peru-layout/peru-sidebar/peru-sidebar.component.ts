import { Component, Input } from '@angular/core';
import { CrisLayoutDefaultSidebarComponent } from '../../default-layout/sidebar/cris-layout-default-sidebar.component';
import { Location } from '@angular/common';
import { Tab } from '../../../core/layout/models/tab.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ds-peru-sidebar',
  templateUrl: './peru-sidebar.component.html',
  styleUrls: ['./peru-sidebar.component.scss']
})
export class PeruSidebarComponent extends CrisLayoutDefaultSidebarComponent {

  /**
   * tabs list
   */
  @Input() itemSourceTabs: Tab[];

  constructor(protected location: Location, protected router: Router, protected route: ActivatedRoute) {
    super(location, router, route);
  }

  isItemSourceContentEmpty(tab: Tab): boolean {
    return this.itemSourceTabs && this.itemSourceTabs.filter((st) => st.shortname === tab.shortname).length === 0;
  }

}
