import { Injectable } from '@angular/core';
import {
  getFirstCompletedRemoteData,
} from '../../../core/shared/operators';
import { switchMap, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { RemoteData } from '../../../core/data/remote-data';
import { Relationship } from '../../../core/shared/item-relationships/relationship.model';
import { NoContent } from '../../../core/shared/NoContent.model';
import { RelationshipService } from '../../../core/data/relationship.service';
import { RelationshipTypeService } from '../../../core/data/relationship-type.service';
import { Item } from '../../../core/shared/item.model';
import { RelationshipType } from '../../../core/shared/item-relationships/relationship-type.model';
import { of } from 'rxjs/internal/observable/of';
import { AuthService } from '../../../core/auth/auth.service';
import { hasValue } from '../../empty.util';
import { ResearcherProfileService } from '../../../core/profile/researcher-profile.service';

@Injectable()
export class NotificationMenuService {

  constructor(
    protected relationshipService: RelationshipService,
    protected relationshipTypeService: RelationshipTypeService,
    protected authService: AuthService,
    protected researcherProfileService: ResearcherProfileService
  ) {

  }

  /**
   * Check if the notification belongs to the current user.
   * @param notification
   */
  public isResearcherNotification(notification: Item): Observable<boolean> {
    if (notification.firstMetadataValue('dspace.entity.type') !== 'Notification') {
      return of(false);
    }

    // when the logged in user can see the notification but not its recipients
    //   we can assume that he is one of the recipients
    const recipients = notification.allMetadata('perucris.notification.to');
    if (recipients.length === 0) {
      return of(true);
    }

    return this.authService.getAuthenticatedUserFromStore().pipe(switchMap((ePerson) => {

     // when a logged in user can see the notification's recipients we check whether he belongs to them.
      const notificationToAdmin = hasValue(recipients.find((metadataValue) => metadataValue.authority === ePerson.uuid));
      return of(notificationToAdmin);
    }));
  }

  /**
   * Check if the notification is hidden.
   * @param notification
   */
  public isHiddenObs(notification: Item): Observable<boolean> {
    return this.getIsNotificationHiddenFor(notification).pipe(take(1));
  }

  /**
   * Makes the notification hidden.
   * @param notification
   */
  public hideNotification(notification: Item): Observable<RemoteData<Relationship>> {
    return this.authService.getAuthenticatedUserFromStore().pipe(
      switchMap((ePerson) => this.createNotificationRelationship('isNotificationHiddenFor', notification, ePerson)),
      getFirstCompletedRemoteData()
    );
  }

  /**
   * Makes the notification visible.
   * @param notification
   */
  public showNotification(notification: Item): Observable<RemoteData<NoContent>> {
    return this.authService.getAuthenticatedUserFromStore().pipe(
      switchMap((ePerson) => this.deleteNotificationRelationship('isNotificationHiddenFor', notification, ePerson)
      ));
  }

  // --------------
  // @ Private
  // --------------

  private getIsNotificationHiddenFor(notification: Item): Observable<boolean> {
    return this.authService.getAuthenticatedUserFromStore().pipe(
      switchMap((ePerson) => this.researcherProfileService.getCtiVitaeFromEPerson(ePerson)),
      switchMap((ctiVitae) => this.relationshipService.relationshipExists(notification, ctiVitae,'isNotificationHiddenFor', false)));
  }

  private getRelationshipType(label: string, item1: Item, item2: Item): Observable<RelationshipType> {
    const type1 = item1.firstMetadataValue('dspace.entity.type');
    const type2 = item2.firstMetadataValue('dspace.entity.type');
    return this.relationshipTypeService.getRelationshipTypeByLabelAndTypes(label, type1, type2);
  }

  private createNotificationRelationship(label: string, notification, ePerson): Observable<RemoteData<Relationship>> {
    return this.researcherProfileService.getCtiVitaeFromEPerson(ePerson).pipe(switchMap((ctiVitae) => {
      return this.getRelationshipType(label, notification, ctiVitae).pipe(
        switchMap((relationshipType) => this.relationshipService.addRelationship(relationshipType.id, notification, ctiVitae)));
    }));

  }

  private deleteNotificationRelationship(label: string, notification, ePerson): Observable<RemoteData<NoContent>> {
    return this.researcherProfileService.getCtiVitaeFromEPerson(ePerson).pipe(switchMap((ctiVitae) => {
      return this.relationshipService.getRelationshipByItemsAndLabel(notification, ctiVitae, label).pipe(
        switchMap((relationship) => this.relationshipService.deleteRelationship(relationship.id, ''))
      );
    }));
  }



}
