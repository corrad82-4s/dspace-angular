import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShadowCopiesComponent } from './shadow-copies.component';

describe('ShadowCopiesDetailsComponent', () => {
  let component: ShadowCopiesComponent;
  let fixture: ComponentFixture<ShadowCopiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShadowCopiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShadowCopiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
