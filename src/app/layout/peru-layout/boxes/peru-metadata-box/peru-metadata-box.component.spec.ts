import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeruMetadataBoxComponent } from './peru-metadata-box.component';

describe('PeruMetadataBoxComponent', () => {
  let component: PeruMetadataBoxComponent;
  let fixture: ComponentFixture<PeruMetadataBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeruMetadataBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeruMetadataBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
