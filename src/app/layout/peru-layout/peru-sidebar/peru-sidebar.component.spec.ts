import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeruSidebarComponent } from './peru-sidebar.component';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

describe('PeruSidebarComponent', () => {
  let component: PeruSidebarComponent;
  let fixture: ComponentFixture<PeruSidebarComponent>;
  const router = jasmine.createSpyObj('router', ['navigate']);
  const location = {
    path(): string {
      return '/items/a96c6d24-757a-411d-8132-bbcbbbb04210/person-biography';
    }
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeruSidebarComponent ],
      providers: [
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: router }
      ],
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
