import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { ContextMenuComponent } from './context-menu.component';
import { EditItemMenuComponent } from './edit-item/edit-item-menu.component';
import { ExportItemMenuComponent } from './export-item/export-item-menu.component';
import { AuditItemMenuComponent } from './audit-item/audit-item-menu.component';
import { DsoPageEditMenuComponent } from './dso-page-edit/dso-page-edit-menu.component';
import { ExportCollectionMenuComponent } from './export-collection/export-collection-menu.component';
import { BulkImportMenuComponent } from './bulk-import/bulk-import-menu.component';
import { ClaimItemMenuComponent } from './claim-item/claim-item-menu.component';
import { AddCvPublicationMenuComponent } from './add-cv-publication/add-cv-publication-menu.component';
import { AddCvPatentMenuComponent } from './add-cv-patent/add-cv-patent-menu.component';
import { AddCvProjectMenuComponent } from './add-cv-project/add-cv-project-menu.component';
import { ModifyForProfileMenuComponent } from './modify-for-profile/modify-for-profile-menu.component';

const COMPONENTS = [
  BulkImportMenuComponent,
  DsoPageEditMenuComponent,
  AuditItemMenuComponent,
  ContextMenuComponent,
  EditItemMenuComponent,
  ExportItemMenuComponent,
  ExportCollectionMenuComponent,
  ClaimItemMenuComponent,
  AddCvPublicationMenuComponent,
  AddCvProjectMenuComponent,
  AddCvPatentMenuComponent,
  ModifyForProfileMenuComponent
];

const ENTRY_COMPONENTS = [
  BulkImportMenuComponent,
  DsoPageEditMenuComponent,
  AuditItemMenuComponent,
  EditItemMenuComponent,
  ExportItemMenuComponent,
  ExportCollectionMenuComponent,
  ClaimItemMenuComponent,
  AddCvPublicationMenuComponent,
  AddCvProjectMenuComponent,
  AddCvPatentMenuComponent,
  ModifyForProfileMenuComponent
];

const MODULE = [
  CommonModule,
  NgbDropdownModule,
  RouterModule,
  TranslateModule
];
@NgModule({
  imports: [
    MODULE
  ],
  declarations: [
    COMPONENTS
  ],
  exports: [
    COMPONENTS
  ],
  entryComponents: [
    ENTRY_COMPONENTS
  ]
})
export class ContextMenuModule {

}
