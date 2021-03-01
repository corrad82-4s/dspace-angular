import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeruTabComponent } from './peru-tab.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BoxDataService } from '../../../core/layout/box-data.service';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { BoxDataServiceMock } from '../../default-layout/tab/cris-layout-default-tab.component.spec';
import { CrisLayoutDefaultTabComponent } from '../../default-layout/tab/cris-layout-default-tab.component';

describe('PeruTabComponent', () => {
  let component: PeruTabComponent;
  let fixture: ComponentFixture<PeruTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeruTabComponent ],
      providers: [
        {provide: BoxDataService, useClass: BoxDataServiceMock},
        {provide: BitstreamDataService, useValue: {}}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeruTabComponent);
    component = fixture.componentInstance;

    // This allow us to spy over the super implementation
    spyOn(CrisLayoutDefaultTabComponent.prototype, 'ngOnInit').and.returnValue(null);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('instantiateBox should assign the itemSource and other properties', () => {

    // set up test
    const componentRef = { instance: {} };
    const componentFactory: any = 'componentFactory';
    const box: any = 'box';
    const item: any = 'item';
    const itemSource: any = 'itemSource';
    const viewContainerRef: any = jasmine.createSpyObj('viewContainerRef', ['createComponent']);
    viewContainerRef.createComponent.and.returnValue(componentRef);
    component.item = item;
    component.itemSource = itemSource;

    const componentRefResult = component.instantiateBox(viewContainerRef, componentFactory, box);

    expect(viewContainerRef.createComponent).toHaveBeenCalledWith(componentFactory);
    expect((componentRefResult.instance as any).item).toBe(item);
    expect((componentRefResult.instance as any).itemSource).toBe(itemSource);
    expect((componentRefResult.instance as any).box).toBe(box);
  });
});
