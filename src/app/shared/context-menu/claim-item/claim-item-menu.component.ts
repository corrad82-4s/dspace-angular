import { NotificationsService } from './../../notifications/notifications.service';
import { notificationsStateSelector } from './../../notifications/selectors';
import { Router } from '@angular/router';
import { ResearcherProfileService } from './../../../core/profile/researcher-profile.service';
import { Component, Inject, OnInit } from '@angular/core';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { rendersContextMenuEntriesForType } from '../context-menu.decorator';
import { getFirstSucceededRemoteData } from 'src/app/core/shared/operators';
import { mergeMap } from 'rxjs/operators';
import { RemoteData } from 'src/app/core/data/remote-data';
import { ResearcherProfile } from 'src/app/core/profile/model/researcher-profile.model';
import { isNotUndefined } from '../../empty.util';
import { Observable } from 'rxjs';

@Component({
  selector: 'ds-context-menu-claim-item',
  templateUrl: './claim-item-menu.component.html'
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class ClaimItemMenuComponent extends ContextMenuEntryComponent {

  /**
   * Initialize instance variables
   *
   * @param {DSpaceObject} injectedContextMenuObject
   * @param {DSpaceObjectType} injectedContextMenuObjectType
   * @param {AuthorizationDataService} authorizationService
   */
  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    protected authorizationService: AuthorizationDataService,
    private researcherProfileService: ResearcherProfileService,
    private router: Router,
    private notificationsService: NotificationsService
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType);
  }

  claim() {

    this.researcherProfileService.createFromExternalSource(this.injectedContextMenuObject.self)
      .pipe(
        getFirstSucceededRemoteData(),
        mergeMap((rd: RemoteData<ResearcherProfile>) => {
          return this.researcherProfileService.findRelatedItemId(rd.payload);
        }))
      .subscribe((id: string) => {
        if (isNotUndefined(id)) {
          this.router.navigateByUrl('/items/' + id);
        } else {
          this.notificationsService.error('researcherprofile.error.claim.title', 'researcherprofile.error.claim.body');
        }
        });
  }

  isClaimable(): Observable<boolean> {
    return this.authorizationService.isAuthorized(FeatureID.CanClaimItem, this.contextMenuObject.self);
  }

}
