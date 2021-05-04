import { NotificationMenuService } from './notification-menu.service';
import { RelationshipService } from '../../../core/data/relationship.service';
import { RelationshipTypeService } from '../../../core/data/relationship-type.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ResearcherProfileService } from '../../../core/profile/researcher-profile.service';
import { Item } from '../../../core/shared/item.model';
import { EPerson } from '../../../core/eperson/models/eperson.model';
import { RelationshipType } from '../../../core/shared/item-relationships/relationship-type.model';
import { Relationship } from '../../../core/shared/item-relationships/relationship.model';
import { of } from 'rxjs/internal/observable/of';
import { createSuccessfulRemoteDataObject } from '../../remote-data.utils';
import { RemoteData } from '../../../core/data/remote-data';
import { NoContent } from '../../../core/shared/NoContent.model';
import createSpy = jasmine.createSpy;

describe('NotificationMenuService', () => {
  let service: NotificationMenuService;

  let relationshipService: RelationshipService;
  let relationshipTypeService: RelationshipTypeService;
  let authService: AuthService;
  let researcherProfileService: ResearcherProfileService;

  const ctiVitae: Item = Object.assign(new Item(), {
    metadata: [{
      'dspace.entity.type': [{ value: 'CvPerson'}]
    }]
  });

  const user: EPerson = {
    uuid: 'loggedInUserUUID'
  } as any;
  const isNotificationHiddenFor: RelationshipType = {
    id: 'isNotificationHiddenForId'
  } as any;
  const notificationHiddenRel: Relationship = {
    id: 'notificationHiddenRelId'
  } as any;

  const publication: Item = Object.assign(new Item(), {
    metadata: [{
      'dspace.entity.type': [{ value: 'Publication'}]
    }]
  });

  const notificationWithoutRecipients: Item = Object.assign(new Item(), {
    uuid: 'notificationUUID',
    metadata: [{
      'dspace.entity.type': [{ value: 'Notification'}]
    }]
  });

  const notificationOfAdmin: Item = Object.assign(new Item(), {
    uuid: 'notificationUUID',
    metadata: [{
      'dspace.entity.type': [{ value: 'Notification'}],
      'perucris.notification.to': [ { authority: 'loggedInUserUUID' } ]
    }]
  });

  const notificationNotOfAdmin: Item = Object.assign(new Item(), {
    uuid: 'notificationUUID',
    metadata: [{
      'dspace.entity.type': [{ value: 'Notification'}],
      'perucris.notification.to': [ { authority: 'notAdminUUID' } ]
    }]
  });

  const noContent: NoContent = {};

  beforeEach(() => {

    // General Mocks
    relationshipService = jasmine.createSpyObj('relationshipService', {
      'addRelationship': of(createSuccessfulRemoteDataObject(notificationHiddenRel)),
      'deleteRelationship': of(createSuccessfulRemoteDataObject(noContent)),
      'getRelationshipByItemsAndLabel': of(notificationHiddenRel)
    }) as any;
    relationshipTypeService = jasmine.createSpyObj('relationshipTypeService', {
      'getRelationshipTypeByLabelAndTypes': of(isNotificationHiddenFor)
    }) as any;
    authService = jasmine.createSpyObj('authService', {
      'getAuthenticatedUserFromStore': of(user)
    }) as any;
    researcherProfileService = jasmine.createSpyObj('researcherProfileService', {
      'getCtiVitaeFromEPerson': of(ctiVitae)
    }) as any;

    // Testing Service Instance
    service = new NotificationMenuService(relationshipService, relationshipTypeService, authService, researcherProfileService);

  });

  describe('isResearcherNotification', () => {

    it('should return false if the item is not a notification', (done) => {
      service.isResearcherNotification(publication).subscribe((isResearcherNotification) => {
        expect(isResearcherNotification).toBeFalse();
        done();
      });
    });

    it('should return true if the item has not recipients metadata', (done) => {
      service.isResearcherNotification(notificationWithoutRecipients).subscribe((isResearcherNotification) => {
        expect(isResearcherNotification).toBeTrue();
        done();
      });
    });

    it('should return true if the item has recipients metadata and logged in user belongs to it', (done) => {
      service.isResearcherNotification(notificationOfAdmin).subscribe((isResearcherNotification) => {
        expect(isResearcherNotification).toBeTrue();
        done();
      });
    });

    it('should return false if the item has recipients metadata and logged in user not belongs to it', (done) => {
      service.isResearcherNotification(notificationNotOfAdmin).subscribe((isResearcherNotification) => {
        expect(isResearcherNotification).toBeFalse();
        done();
      });
    });
  });

  describe('isHiddenObs', () => {

    it('should return false if a relationship of type isNotificationHiddenFor and the ctivitae doesn\'t exist', (done) => {

      relationshipService.relationshipExists = createSpy().and.returnValue(of(false));

      service.isHiddenObs(notificationWithoutRecipients).subscribe((isHidden: boolean) => {
        expect(relationshipService.relationshipExists)
          .toHaveBeenCalledWith(notificationWithoutRecipients, ctiVitae, 'isNotificationHiddenFor', false);
        expect(isHidden).toBeFalse();

        done();
      });

    });

    it('should return true if a relationship of type isNotificationHiddenFor and the ctivitae exists', (done) => {

      relationshipService.relationshipExists = createSpy().and.returnValue(of(true));

      service.isHiddenObs(notificationWithoutRecipients).subscribe((isHidden: boolean) => {
        expect(relationshipService.relationshipExists)
          .toHaveBeenCalledWith(notificationWithoutRecipients, ctiVitae, 'isNotificationHiddenFor', false);
        expect(isHidden).toBeTrue();

        done();
      });
    });

  });

  describe('hideNotification', () => {

    it('should create a relationship between notification and ctivitae of type isNotificationHiddenFor', (done) => {
      service.hideNotification(notificationWithoutRecipients).subscribe((result: RemoteData<Relationship>) => {
        expect(relationshipService.addRelationship).toHaveBeenCalledWith(isNotificationHiddenFor.id, notificationWithoutRecipients, ctiVitae);
        expect(result.payload).toBe(notificationHiddenRel);

        done();
      });
    });

  });

  describe('showNotification', () => {

    it('should delete the relationship between notification and the ctivitae of type isNotificationHiddenFor', (done) => {
      service.showNotification(notificationWithoutRecipients).subscribe((result: RemoteData<NoContent>) => {
        expect(relationshipService.deleteRelationship).toHaveBeenCalledWith(notificationHiddenRel.id, '');
        expect(result.payload).toBe(noContent);

        done();
      });
    });

  });

});

