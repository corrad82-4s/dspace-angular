import { getFirstCompletedRemoteData, getFirstSucceededRemoteData } from './../../core/shared/operators';
import { hasSucceeded } from './../../core/data/request.reducer';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, take } from 'rxjs/operators';
import { Operation } from 'fast-json-patch';
import { uniqueId } from 'lodash';

import { EPerson } from '../../core/eperson/models/eperson.model';
import { Metadata } from '../../core/shared/metadata.utils';
import { GrantedApplication } from './models/granted-application.model';
import { MetadataValue } from '../../core/shared/metadata.models';
import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';
import { EPersonDataService } from '../../core/eperson/eperson-data.service';
import { RestResponse } from '../../core/cache/response.models';
import { hasValue, isNotEmpty } from '../../shared/empty.util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { RemoteData } from 'src/app/core/data/remote-data';

export const EPERSON_GRANTED_METADATA = 'perucris.oidc.granted';
export const EPERSON_REJECT_METADATA = 'perucris.oidc.reject';

@Component({
  selector: 'ds-profile-page-granted-applications',
  templateUrl: './profile-page-granted-applications.component.html',
  styleUrls: ['./profile-page-granted-applications.component.scss']
})
export class ProfilePageGrantedApplicationsComponent implements OnInit, OnDestroy {

  /**
   * The user to display the third parties applications for
   */
  @Input() user: EPerson;

  /**
   * The eperson UUID
   */
  public userUUID: string;

  /**
   * Pagination config used to display the list
   */
  public paginationOptions: PaginationComponentOptions = new PaginationComponentOptions();

  /**
   * A boolean representing if an operation is processing
   * @type {BehaviorSubject<boolean>}
   */
  public processing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * The list of GrantedApplication
   * @private
   */
  private applicationList$: BehaviorSubject<GrantedApplication[]> = new BehaviorSubject<GrantedApplication[]>([]);

  /**
   * The list of eperson granted metadata values
   * @private
   */
  private grantedMetadataValues$: BehaviorSubject<MetadataValue[]> = new BehaviorSubject<MetadataValue[]>([]);

  /**
   * Subscription to track and to unsubscribe onDestroy
   */
  private sub: Subscription;

  /**
   * Initialize instance variables
   *
   * @param {EPersonDataService} epersonService
   * @param {NgbModal} modalService
   * @param {NotificationsService} notificationsService
   * @param {TranslateService} translate
   */
  constructor(
    private epersonService: EPersonDataService,
    private modalService: NgbModal,
    private notificationsService: NotificationsService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    this.paginationOptions.id = uniqueId('granted-application-list-pagination');
    this.paginationOptions.pageSize = 5;
    if (this.user) {
      this.userUUID = this.user.id;
      // Subscribe to metadata list changes
      this.sub = this.grantedMetadataValues$.pipe(
        filter((metadataValues) => isNotEmpty(metadataValues)),
        distinctUntilChanged()
      ).subscribe((metadataValues) => {
        this.buildApplicationListFromMetadata(metadataValues);
      });

      this.grantedMetadataValues$.next(Metadata.all(this.user.metadata, EPERSON_GRANTED_METADATA));
    }
  }

  /**
   * Emit an observable with the list of GrantedApplication
   */
  getApplications(): Observable<GrantedApplication[]> {
    return this.applicationList$.asObservable();
  }

  /**
   * Show a confirmation modal and dispatch a revoke action
   */
  public confirmRevoke(content: any, place: number, encodedValue: string) {
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'ok') {
          this.revokePermission(place, encodedValue);
        }
      }
    );
  }

  /**
   * Set the current page for the pagination system
   *
   * @param {number} page
   *    the number of the current page
   */
  setPage(page: number) {
    this.paginationOptions.currentPage = page;
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy(): void {
    if (hasValue(this.sub)) {
      this.sub.unsubscribe();
    }
  }

  /**
   * Build the list of granted application by eperson metadata
   * @param metadataValues The array of metadata value from which retrieve the list
   * @private
   */
  private buildApplicationListFromMetadata(metadataValues: MetadataValue[]): void {

    const list: GrantedApplication[] = metadataValues.map((metadata: MetadataValue) => {
      const parsedObj = JSON.parse(metadata.value);
      return {
        id: parsedObj.id,
        clientName: parsedObj.clientName,
        clientId: parsedObj.clientId,
        scopes: parsedObj.scopes.split(',').map((value: string) => value.trim()),
        issuedAt: parsedObj.issuedAt,
        expireAt: parsedObj.expireAt,
        encodedValue: metadata.value,
        place: metadata.place
      };
    });

    this.applicationList$.next(list);
  }

  /**
   * Build and dispatch patch operations in order to revoke a grant for an application
   *
   * @param place        The place of the metadata that represent an application
   * @param encodedValue The json encoded value of the metadata that represent an application
   * @private
   */
  private revokePermission(place: number, encodedValue: string) {
    this.processing$.next(true);
    const operations: Operation[] = [
      { op: 'remove', path: `/metadata/${EPERSON_GRANTED_METADATA}/${place}` },
      { op: 'add', path: `/metadata/${EPERSON_REJECT_METADATA}/-`, value: encodedValue }
    ];

    this.epersonService.patch(this.user, operations).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((response: RemoteData<EPerson>) => {
      if (response.hasSucceeded) {
        const newMetadataList = this.grantedMetadataValues$.value
          .filter((metadata: MetadataValue) => metadata.place !== place);
        this.grantedMetadataValues$.next(newMetadataList);
        this.processing$.next(false);
      } else {
        this.notificationsService.error(null, this.translate.get('profile.granted-applications.revoke.error'));
      }
    });
  }

}
