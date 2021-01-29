import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeruTabComponent } from './peru-tab.component';

describe('PeruTabComponent', () => {
  let component: PeruTabComponent;
  let fixture: ComponentFixture<PeruTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeruTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeruTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
