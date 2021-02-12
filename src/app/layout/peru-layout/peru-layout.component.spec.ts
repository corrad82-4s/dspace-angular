import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { PeruLayoutComponent } from './peru-layout.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TabDataService } from '../../core/layout/tab-data.service';
import { CrisLayoutDefaultComponent } from '../default-layout/cris-layout-default.component';
import { AuthService } from '../../core/auth/auth.service';
import { createSuccessfulRemoteDataObject } from '../../shared/remote-data.utils';
import { of } from 'rxjs/internal/observable/of';
import { createPaginatedList } from '../../shared/testing/utils.test';
import { tabs } from '../../shared/testing/tab.mock';

const authServiceMock: any = jasmine.createSpyObj('AuthService', {
  isAuthenticated: jasmine.createSpy('isAuthenticated')
});

function createTabDataServiceMock() {
  return new TabDataService(null, null, null, null, null, null, null);
}

describe('PeruLayoutComponent', () => {
  let component: PeruLayoutComponent;
  let componentAsAny: any;
  let fixture: ComponentFixture<PeruLayoutComponent>;
  let tabDataService: TabDataService;

  beforeEach(async () => {
    tabDataService = createTabDataServiceMock();
    await TestBed.configureTestingModule({
      declarations: [ PeruLayoutComponent ],
      providers: [
        { provide: TabDataService, useValue: tabDataService },
        { provide: AuthService, useValue: authServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeruLayoutComponent);
    component = fixture.componentInstance;
    componentAsAny = component;

    // This allow us to spy over the super implementation
    spyOn(CrisLayoutDefaultComponent.prototype, 'ngOnInit').and.returnValue(null);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('instantiateTab should assign the sourceItem and other properties', () => {

    // set up test
    const componentRef = { instance: {} };
    const componentFactory: any = 'componentFactory';
    const tab: any = 'tab';
    const item: any = 'item';
    const sourceItem: any = 'sourceItem';
    const viewContainerRef: any = jasmine.createSpyObj('viewContainerRef', ['createComponent']);
    viewContainerRef.createComponent.and.returnValue(componentRef);
    component.item = item;
    component.sourceItem = sourceItem;

    const componentRefResult = component.instantiateTab(viewContainerRef, componentFactory, tab);

    expect(viewContainerRef.createComponent).toHaveBeenCalledWith(componentFactory);
    expect((componentRefResult.instance as any).item).toBe(item);
    expect((componentRefResult.instance as any).sourceItem).toBe(sourceItem);
    expect((componentRefResult.instance as any).tab).toBe(tab);
  });

  describe('onSelectSourceOfInformation', () => {

    const sourceItem: any = { id: 'id'};
    const sourceItemTabs = tabs;
    const selectedTab: any = 'selectedTab';

    beforeEach(() => {
      componentAsAny.selectedTab = selectedTab;

      spyOn(tabDataService, 'findByItem').and.returnValue(of(createSuccessfulRemoteDataObject(createPaginatedList(sourceItemTabs))));
      spyOn(component, 'changeTab').and.returnValue(null);

      component.onSelectSourceOfInformation(sourceItem);
    });

    it('should assign the sourceItem', () => {
      expect(component.sourceItem).toBe(sourceItem);
    });

    it('should call changeTab with the sourceItem', () => {
      expect(component.changeTab).toHaveBeenCalledWith(selectedTab);
    });

    it('should find tabs of sourceItem and assign to sourceItemTabs', fakeAsync(() => {
      tick();
      expect(tabDataService.findByItem).toHaveBeenCalledWith(sourceItem.id);
      expect(component.sourceItemTabs).toBe(sourceItemTabs);
    }));
  });
});
