import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ProfilePageRoutingModule } from './profile-page-routing.module';
import { ProfilePageComponent } from './profile-page.component';
import { ProfilePageMetadataFormComponent } from './profile-page-metadata-form/profile-page-metadata-form.component';
import { ProfilePageSecurityFormComponent } from './profile-page-security-form/profile-page-security-form.component';
import { ProfilePageResearcherFormComponent } from './profile-page-researcher-form/profile-page-researcher-form.component';
import { ThemedProfilePageComponent } from './themed-profile-page.component';
import { ProfilePageGrantedApplicationsComponent } from './profile-page-granted-applications/profile-page-granted-applications.component';
import { ProfilePageTwophaseAuthenticationComponent } from './profile-page-twophase-authentication/profile-page-twophase-authentication.component';

@NgModule({
  imports: [
    ProfilePageRoutingModule,
    CommonModule,
    SharedModule
  ],
  exports: [
    ProfilePageSecurityFormComponent
  ],
  declarations: [
    ProfilePageComponent,
    ThemedProfilePageComponent,
    ProfilePageMetadataFormComponent,
    ProfilePageSecurityFormComponent,
    ProfilePageResearcherFormComponent,
    ProfilePageGrantedApplicationsComponent,
    ProfilePageTwophaseAuthenticationComponent
  ]
})
export class ProfilePageModule {

}
