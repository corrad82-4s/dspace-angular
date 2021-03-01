import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ViewContainerRef } from '@angular/core';
import { CrisLayoutPage } from '../decorators/cris-layout-page.decorator';
import { LayoutPage } from '../enums/layout-page.enum';
import { TabDataService } from '../../core/layout/tab-data.service';
import { AuthService } from '../../core/auth/auth.service';
import { CrisLayoutDefaultComponent } from '../default-layout/cris-layout-default.component';
import { Tab } from '../../core/layout/models/tab.model';
import { getFirstSucceededRemoteListPayload } from '../../core/shared/operators';
import { ItemSource } from '../../core/item-sources/model/item-sources.model';

@Component({
  selector: 'ds-peru-layout',
  templateUrl: './peru-layout.component.html',
  styleUrls: ['./peru-layout.component.scss']
})
@CrisLayoutPage(LayoutPage.DEFAULT_PERU)
export class PeruLayoutComponent extends CrisLayoutDefaultComponent {

  itemSource: ItemSource;

  itemSourceTabs: Tab[];

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
   * Overridden in order to pass the sourceItem to the tab component.
   * @param viewContainerRef
   * @param componentFactory
   * @param box
   */
  instantiateTab(viewContainerRef: ViewContainerRef, componentFactory: ComponentFactory<any>, tab: Tab): ComponentRef<any> {
    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as any).item = this.item;
    (componentRef.instance as any).itemSource = this.itemSource;
    (componentRef.instance as any).tab = tab;
    return componentRef;
  }

  /**
   * When an itemSource is selected its tabs are fetched and the selectedTab updated.
   * @param itemSource
   */
  onSelectItemSource(itemSource: ItemSource) {

    // Reset previous
    this.itemSource = itemSource;
    this.itemSourceTabs = null;

    if (this.itemSource) {
      // Retrieve sourceItem tabs by UUID of item
      this.tabService.findByItem(this.itemSource.itemUuid).pipe(
        getFirstSucceededRemoteListPayload()
      ).subscribe((itemSourceTabs: Tab[]) => {
        this.itemSourceTabs = itemSourceTabs;
      });

    }

    this.changeTab(this.selectedTab);
  }

}



