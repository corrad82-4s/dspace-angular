import { Injectable } from '@angular/core';
import {
  getAllSucceededRemoteDataPayload,
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload
} from '../../../core/shared/operators';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { RemoteData } from '../../../core/data/remote-data';
import { Relationship } from '../../../core/shared/item-relationships/relationship.model';
import { NoContent } from '../../../core/shared/NoContent.model';
import { RelationshipService } from '../../../core/data/relationship.service';
import { RelationshipTypeService } from '../../../core/data/relationship-type.service';
import { ItemDataService } from '../../../core/data/item-data.service';
import { Item } from '../../../core/shared/item.model';
import { RelationshipType } from '../../../core/shared/item-relationships/relationship-type.model';
import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class NotificationMenuService {

  constructor(
    protected relationshipService: RelationshipService,
    protected relationshipTypeService: RelationshipTypeService,
    protected itemService: ItemDataService
  ) {

  }

  public isHiddenObs(notification: Item): Observable<boolean> {
    return this.relationshipService.getItemRelationshipsByLabel(notification, 'isNotificationHiddenFor')
      .pipe(
        getAllSucceededRemoteDataPayload(),
        map((response) => {
          return response.page.length === 0;
        } )
      );
  }

  public hideNotification(notification: Item): Observable<RemoteData<Relationship>> {
    return this.itemService.findById(notification.firstMetadata('perucris.notification.to').authority).pipe(
      getFirstSucceededRemoteDataPayload(),
      switchMap((item) => this.createRelationship('isNotificationHiddenFor', notification, item)),
      getFirstCompletedRemoteData()
    );
  }

  public showNotification(notification: Item): Observable<RemoteData<NoContent>> {
      return this.deleteRelationship('isNotificationHiddenFor', notification);
  }

  private getRelationshipType(label: string, item1: Item, item2: Item): Observable<RelationshipType> {
    const type1 = item1.firstMetadataValue('dspace.entity.type');
    const type2 = item2.firstMetadataValue('dspace.entity.type');
    return this.relationshipTypeService.getRelationshipTypeByLabelAndTypes(label, type1, type2);
  }

  private createRelationship(label: string, item1, item2): Observable<RemoteData<Relationship>> {
    return this.getRelationshipType(label, item1, item2).pipe(
      switchMap((relationshipType) => this.relationshipService.addRelationship(relationshipType.id, item1, item2))
    );
  }

  private deleteRelationship(label: string, notification): Observable<RemoteData<NoContent>> {
    return this.relationshipService.getItemRelationshipsByLabel(notification, label).pipe(
      getFirstSucceededRemoteDataPayload(),
      switchMap((relationships) => this.relationshipService
        .deleteRelationship(relationships.page[0].id, ''))
    );
  }

}
