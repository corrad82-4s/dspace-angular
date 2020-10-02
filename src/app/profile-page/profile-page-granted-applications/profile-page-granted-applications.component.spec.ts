import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePageGrantedApplicationsComponent } from './profile-page-granted-applications.component';

describe('ProfilePageGrantedApplicationsComponent', () => {
  let component: ProfilePageGrantedApplicationsComponent;
  let fixture: ComponentFixture<ProfilePageGrantedApplicationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilePageGrantedApplicationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePageGrantedApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
