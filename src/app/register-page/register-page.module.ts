import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { RegisterPageRoutingModule } from './register-page-routing.module';
import { RegisterEmailComponent } from './register-email/register-email.component';
import { CreateProfileComponent } from './create-profile/create-profile.component';
import { RegisterEmailFormModule } from '../register-email-form/register-email-form.module';
import { ProfilePageModule } from '../profile-page/profile-page.module';
import { ThemedCreateProfileComponent } from './create-profile/themed-create-profile.component';
import { RegisterDniComponent } from './register-dni/register-dni.component';
import { RegisterDniProfileComponent } from './register-dni/register-dni-profile/register-dni-profile.component';
import { RegisterNavbarComponent } from './register-navbar/register-navbar.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RegisterPageRoutingModule,
    RegisterEmailFormModule,
    ProfilePageModule,
  ],
  declarations: [
    RegisterEmailComponent,
    CreateProfileComponent,
    ThemedCreateProfileComponent,
    RegisterNavbarComponent,
    RegisterDniComponent,
    RegisterDniProfileComponent
  ],
  providers: []
})

/**
 * Module related to components used to register a new user
 */
export class RegisterPageModule {

}
