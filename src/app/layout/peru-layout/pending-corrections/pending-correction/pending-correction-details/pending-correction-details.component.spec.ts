import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingCorrectionDetailsComponent } from './pending-correction-details.component';

describe('PendingCorrectionDetailsComponent', () => {
  let component: PendingCorrectionDetailsComponent;
  let fixture: ComponentFixture<PendingCorrectionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingCorrectionDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingCorrectionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
