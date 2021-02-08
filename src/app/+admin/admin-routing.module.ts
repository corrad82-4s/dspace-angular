import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MetadataImportPageComponent } from './admin-import-metadata-page/metadata-import-page.component';
import { AdminSearchPageComponent } from './admin-search-page/admin-search-page.component';
import { I18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { AdminWorkflowPageComponent } from './admin-workflow-page/admin-workflow-page.component';
import { I18nBreadcrumbsService } from '../core/breadcrumbs/i18n-breadcrumbs.service';
import { AdminCurationTasksComponent } from './admin-curation-tasks/admin-curation-tasks.component';
import { AdminEditUserAgreementComponent } from './admin-edit-user-agreement/admin-edit-user-agreement.component';
import { ACCESS_CONTROL_MODULE_PATH, REGISTRIES_MODULE_PATH, NOTIFICATIONS_MODULE_PATH, INSTITUTIONS_MODULE_PATH } from './admin-routing-paths';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: INSTITUTIONS_MODULE_PATH,
        loadChildren: () => import('./admin-institutions/admin-institutions.module')
        .then((m) => m.AdminInstitutionsModule),
      },
      {
        path: NOTIFICATIONS_MODULE_PATH,
        loadChildren: () => import('./admin-notifications/admin-notifications.module')
          .then((m) => m.AdminNotificationsModule),
      },
      {
        path: REGISTRIES_MODULE_PATH,
        loadChildren: () => import('./admin-registries/admin-registries.module')
          .then((m) => m.AdminRegistriesModule),
      },
      {
        path: ACCESS_CONTROL_MODULE_PATH,
        loadChildren: () => import('./admin-access-control/admin-access-control.module')
          .then((m) => m.AdminAccessControlModule),
      },
      {
        path: 'search',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: AdminSearchPageComponent,
        data: { title: 'admin.search.title', breadcrumbKey: 'admin.search' }
      },
      {
        path: 'workflow',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: AdminWorkflowPageComponent,
        data: { title: 'admin.workflow.title', breadcrumbKey: 'admin.workflow' }
      },
      {
        path: 'curation-tasks',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: AdminCurationTasksComponent,
        data: { title: 'admin.curation-tasks.title', breadcrumbKey: 'admin.curation-tasks' }
      },
      {
        path: 'metadata-import',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: MetadataImportPageComponent,
        data: { title: 'admin.metadata-import.title', breadcrumbKey: 'admin.metadata-import' }
      },
      {
        path: 'edit-user-agreement',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: AdminEditUserAgreementComponent,
        data: { title: 'admin.edit-user-agreement.title', breadcrumbKey: 'admin.edit-user-agreement' }
      },
    ])
  ],
  providers: [
    I18nBreadcrumbResolver,
    I18nBreadcrumbsService
  ]
})
export class AdminRoutingModule {

}
