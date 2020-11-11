import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { I18nBreadcrumbResolver } from 'src/app/core/breadcrumbs/i18n-breadcrumb.resolver';
import { getInstitutionsModuleRoute } from '../admin-routing-paths';
import { InstitutionCreationComponent } from './institution-creation/institution-creation.component';
import { InstitutionExploreComponent } from './institution-explore/institution-explore.component';

export function getInstitutionExploreRoute() {
  return getInstitutionsModuleRoute() + '/explore';
}

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'new',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        data: {title: 'admin.institution.new.title', breadcrumbKey: 'admin.institution.new'},
        component: InstitutionCreationComponent
      },
      {
        path: 'explore',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        data: {title: 'admin.institution.explore.title', breadcrumbKey: 'admin.institution.explore'},
        component: InstitutionExploreComponent
      },
    ])
  ]
})
export class AdminInstitutionsRoutingModule {

}