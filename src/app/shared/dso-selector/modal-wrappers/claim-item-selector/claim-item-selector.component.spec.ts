/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimItemSelectorComponent } from './claim-item-selector.component';

describe('ClaimItemSelectorComponent', () => {
  let component: ClaimItemSelectorComponent;
  let fixture: ComponentFixture<ClaimItemSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimItemSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimItemSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
//   FIXME: to be completed
});
