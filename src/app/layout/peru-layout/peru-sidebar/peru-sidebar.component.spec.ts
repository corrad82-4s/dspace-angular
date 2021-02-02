import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeruSidebarComponent } from './peru-sidebar.component';

describe('PeruSidebarComponent', () => {
  let component: PeruSidebarComponent;
  let fixture: ComponentFixture<PeruSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeruSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeruSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
