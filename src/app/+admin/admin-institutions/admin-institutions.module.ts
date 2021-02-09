import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { BitstreamFormatsModule } from '../admin-registries/bitstream-formats/bitstream-formats.module';
import { AdminInstitutionsRoutingModule } from './admin-institutions-routing.module';
import { InstitutionCreationComponent } from './institution-creation/institution-creation.component';
import { InstitutionExploreComponent } from './institution-explore/institution-explore.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    TranslateModule,
    BitstreamFormatsModule,
    AdminInstitutionsRoutingModule
  ],
  declarations: [
    InstitutionExploreComponent,
    InstitutionCreationComponent
  ],
  entryComponents: [
  ]
})
export class AdminInstitutionsModule {

}
