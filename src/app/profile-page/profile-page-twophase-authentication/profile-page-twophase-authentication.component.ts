import { hasSucceeded } from './../../core/data/request.reducer';
import { RemoteData } from './../../core/data/remote-data';
import { Component, Input, OnInit } from '@angular/core';
import { EPerson } from '../../core/eperson/models/eperson.model';
import { TranslateService } from '@ngx-translate/core';
import { Metadata } from '../../core/shared/metadata.utils';
import { MetadataValue } from '../../core/shared/metadata.models';
import { uniqueId } from 'lodash';
import { EPersonDataService } from '../../core/eperson/eperson-data.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { Operation } from 'fast-json-patch';
import { distinctUntilChanged, filter, take } from 'rxjs/operators';
import { RestResponse } from '../../core/cache/response.models';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

export const EPERSON_TWOPHASE_AUTHENTICATION = 'perucris.authentication.twophase';

@Component({
  selector: 'ds-profile-page-twophase-authtentication',
  templateUrl: './profile-page-twophase-authentication.component.html'
})
/**
 * Component for a user to edit their security information
 * Displays a form containing a password field and a confirmation of the password
 */
export class ProfilePageTwophaseAuthenticationComponent implements OnInit {

  /**
   * The user to display the third parties applications for
   */
  @Input() user: EPerson;

  /**
   * The eperson UUID
   */
  public userUUID: string;

  /**
   * The metadata value
   */
  public twoPhaseEnabled: string;

  /**
   * The value to use as the combo box key
   */
  public twoPhaseValue: string;

    /**
     * A boolean representing if an operation is processing
     * @type {BehaviorSubject<boolean>}
     */
  public processing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(protected translate: TranslateService,
              protected epersonService: EPersonDataService,
              protected notificationsService: NotificationsService) {
  }

  /**
   * Method fetch data on init
   */
  ngOnInit(): void {
    if (this.user) {
      this.userUUID = this.user.id;
      const metadataValue = Metadata.first(this.user.metadata, EPERSON_TWOPHASE_AUTHENTICATION);
      if (metadataValue) {
        const twoPhaseState = metadataValue.value;
        this.twoPhaseEnabled = twoPhaseState;
        this.twoPhaseValue = twoPhaseState === 'true' ? 'Enabled' : 'Disabled';
      } else {
        this.twoPhaseEnabled = 'false';
        this.twoPhaseValue = 'Disabled';
      }
    }
  }

  /**
   * Method which update binding on ComboBox changes
   * @param event the combo box value change event
   */
  updateTwoPhase(event): void {
    const currentValue = event.currentTarget.value;
    if (currentValue === 'Enabled') {
      this.twoPhaseEnabled = 'true';
      this.twoPhaseValue = 'Enabled';
    } else {
      this.twoPhaseEnabled = 'false';
      this.twoPhaseValue = 'Disabled';
    }
  }

  /**
   * Update the metadatum value based on user choice
   */
  saveTwoPhase(): void {
    this.processing$.next(true);
    const operations: Operation[] = [
      { op: 'remove', path: `/metadata/${EPERSON_TWOPHASE_AUTHENTICATION}` },
      { op: 'add', path: `/metadata/${EPERSON_TWOPHASE_AUTHENTICATION}/-`, value: this.twoPhaseEnabled }
    ];
    this.epersonService.patch(this.user, operations).pipe(
      take(1)
    ).subscribe((response: RemoteData<EPerson>) => {
      if (response.hasSucceeded) {
        this.processing$.next(false);
      } else {
        this.notificationsService.error(null, this.translate.get('profile.twofactor.notification.error'));
      }
    });
  }

}
