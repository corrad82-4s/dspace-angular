import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterNavbarComponent } from './register-navbar.component';
import { TranslateModule } from '@ngx-translate/core';

describe('RegisterNavbarComponent', () => {
  let component: RegisterNavbarComponent;
  let fixture: ComponentFixture<RegisterNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ RegisterNavbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
