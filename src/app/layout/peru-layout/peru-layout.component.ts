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

  sourceItem: Item;

  sourceItemTabs: Tab[];

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
    (componentRef.instance as any).sourceItem = this.sourceItem;
    (componentRef.instance as any).tab = tab;
    return componentRef;
  }

  /**
   * When a sourceItem is selected his tabs are fetched and the selectedTab updated.
   * @param sourceItem
   */
  onSelectSourceOfInformation(sourceItem: Item) {

    // Reset previous
    this.sourceItem = sourceItem;
    this.sourceItemTabs = null;

    if (this.sourceItem) {
      // Retrieve sourceItem tabs by UUID of item
      this.tabService.findByItem(this.sourceItem.id).pipe(
        getFirstSucceededRemoteListPayload()
      ).subscribe((sourceItemTabs: Tab[]) => {
        this.sourceItemTabs = sourceItemTabs;
      });

    }

    this.changeTab(this.selectedTab);
  }

}



