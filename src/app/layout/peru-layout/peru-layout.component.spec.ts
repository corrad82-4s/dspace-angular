import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeruLayoutComponent } from './peru-layout.component';

describe('PeruLayoutComponent', () => {
  let component: PeruLayoutComponent;
  let fixture: ComponentFixture<PeruLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeruLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeruLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
