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
import { GenericConstructor } from '../../../core/shared/generic-constructor';
import { getCrisLayoutBox } from '../../decorators/cris-layout-box.decorator';
import { Box } from '../../../core/layout/models/box.model';
import { Item } from '../../../core/shared/item.model';

@Component({
  selector: 'ds-peru-tab',
  templateUrl: '../../default-layout/tab/cris-layout-default-tab.component.html',
  styleUrls: ['../../default-layout/tab/cris-layout-default-tab.component.scss']
})
@CrisLayoutTab(LayoutPage.DEFAULT_PERU, LayoutTab.DEFAULT_PERU)
export class PeruTabComponent extends CrisLayoutDefaultTabComponent {

  @Input() shadowCopy: Item;

  constructor(
    public cd: ChangeDetectorRef,
    protected boxService: BoxDataService,
    protected componentFactoryResolver: ComponentFactoryResolver) {

    super(cd, boxService, componentFactoryResolver);

  }

  protected getComponent(boxType: string): GenericConstructor<Component> {
    return getCrisLayoutBox(this.item, this.tab.shortname, boxType);
  }

  /**
   * Overridden in order to pass the shadowCopy to the box component.
   * @param viewContainerRef
   * @param componentFactory
   * @param box
   */
  instantiateBox(viewContainerRef: ViewContainerRef, componentFactory: ComponentFactory<any>, box: Box): ComponentRef<any> {
    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as any).item = this.item;
    (componentRef.instance as any).shadowCopy = this.shadowCopy;
    (componentRef.instance as any).box = box;
    return componentRef;
  }

}
