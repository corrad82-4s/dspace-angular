import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ViewContainerRef } from '@angular/core';
import { CrisLayoutPage } from '../decorators/cris-layout-page.decorator';
import { LayoutPage } from '../enums/layout-page.enum';
import { TabDataService } from '../../core/layout/tab-data.service';
import { AuthService } from '../../core/auth/auth.service';
import { CrisLayoutDefaultComponent } from '../default-layout/cris-layout-default.component';
import { Item } from '../../core/shared/item.model';
import { Tab } from '../../core/layout/models/tab.model';
import { getFirstSucceededRemoteListPayload } from '../../core/shared/operators';

@Component({
  selector: 'ds-peru-layout',
  templateUrl: './peru-layout.component.html',
  styleUrls: ['./peru-layout.component.scss']
})
@CrisLayoutPage(LayoutPage.DEFAULT_PERU)
export class PeruLayoutComponent extends CrisLayoutDefaultComponent {

  shadowCopy: Item;

  shadowCopyTabs: Tab[];

  constructor(
    protected tabService: TabDataService,
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected authService: AuthService
  ) {
    super(tabService, componentFactoryResolver, authService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Overridden in order to pass the shadowCopy to the tab component.
   * @param viewContainerRef
   * @param componentFactory
   * @param box
   */
  instantiateTab(viewContainerRef: ViewContainerRef, componentFactory: ComponentFactory<any>, tab: Tab): ComponentRef<any> {
    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as any).item = this.item;
    (componentRef.instance as any).shadowCopy = this.shadowCopy;
    (componentRef.instance as any).tab = tab;
    return componentRef;
  }

  /**
   * When a shadowCopy is selected his tabs are fetched and the selectedTab updated.
   * @param shadowCopy
   */
  onSelectShadowCopy(shadowCopy: Item) {

    // Reset previous
    this.shadowCopy = shadowCopy;
    this.shadowCopyTabs = null;

    if (this.shadowCopy) {
      // Retrieve shadowCopy tabs by UUID of item
      this.tabService.findByItem(this.shadowCopy.id).pipe(
        getFirstSucceededRemoteListPayload()
      ).subscribe((shadowCopyTabs: Tab[]) => {
        this.shadowCopyTabs = shadowCopyTabs;
      });

    }

    this.changeTab(this.selectedTab);
  }

}



