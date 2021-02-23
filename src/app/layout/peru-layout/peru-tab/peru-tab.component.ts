import {
  ChangeDetectorRef,
  Component,
  ComponentFactory,
  ComponentFactoryResolver, ComponentRef, Input,
  ViewContainerRef
} from '@angular/core';
import { CrisLayoutTab } from '../../decorators/cris-layout-tab.decorator';
import { LayoutPage } from '../../enums/layout-page.enum';
import { LayoutTab } from '../../enums/layout-tab.enum';
import { CrisLayoutDefaultTabComponent } from '../../default-layout/tab/cris-layout-default-tab.component';
import { BoxDataService } from '../../../core/layout/box-data.service';
import { Box } from '../../../core/layout/models/box.model';
import { ItemSource } from '../../../core/item-sources/model/item-sources.model';

@Component({
  selector: 'ds-peru-tab',
  templateUrl: '../../default-layout/tab/cris-layout-default-tab.component.html',
  styleUrls: ['../../default-layout/tab/cris-layout-default-tab.component.scss']
})
@CrisLayoutTab(LayoutPage.DEFAULT_PERU, LayoutTab.DEFAULT_PERU)
export class PeruTabComponent extends CrisLayoutDefaultTabComponent {

  @Input() itemSource: ItemSource;

  constructor(
    public cd: ChangeDetectorRef,
    protected boxService: BoxDataService,
    protected componentFactoryResolver: ComponentFactoryResolver) {

    super(cd, boxService, componentFactoryResolver);

  }

  ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Overridden in order to pass the sourceItem to the box component.
   * @param viewContainerRef
   * @param componentFactory
   * @param box
   */
  instantiateBox(viewContainerRef: ViewContainerRef, componentFactory: ComponentFactory<any>, box: Box): ComponentRef<any> {
    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as any).item = this.item;
    (componentRef.instance as any).itemSource = this.itemSource;
    (componentRef.instance as any).box = box;
    return componentRef;
  }

}
