import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingCorrectionComponent } from './pending-correction.component';

describe('PendingCorrectionComponent', () => {
  let component: PendingCorrectionComponent;
  let fixture: ComponentFixture<PendingCorrectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingCorrectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
