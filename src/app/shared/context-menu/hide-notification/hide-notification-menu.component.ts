import { Component, Inject, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { ConfigurationDataService } from '../../../core/data/configuration-data.service';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { rendersContextMenuEntriesForType } from '../context-menu.decorator';
import { Item } from '../../../core/shared/item.model';
import { take } from 'rxjs/operators';
import { NotificationMenuService } from './notification-menu.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ds-context-menu-hide-notification',
  templateUrl: './hide-notification-menu.component.html',
  providers: [NotificationMenuService]
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class HideNotificationMenuComponent extends ContextMenuEntryComponent implements OnInit {

  public modalRef: NgbModalRef;

  public isResearcherNotification$: Observable<boolean>;

  public isHidden: boolean;

  public isProcessing$: Subject<boolean> = new Subject<boolean>();

  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    protected configurationDataService: ConfigurationDataService,
    protected notificationMenuService: NotificationMenuService,
    protected notificationsService: NotificationsService,
    protected translateService: TranslateService
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType);
  }

  ngOnInit(): void {
    console.log(this.contextMenuObject.allMetadata('perucris.notification.to'));
    this.isResearcherNotification$ = this.notificationMenuService.isResearcherNotification(this.contextMenuObject as Item);
    this.updateIsHidden();
  }

  show() {
    this.isProcessing$.next(true);
    this.notificationMenuService.showNotification(this.contextMenuObject as Item)
      .pipe(take(1))
      .subscribe((response) => {
        this.isProcessing$.next(false);
        this.notificationsService.success(this.translateService.get('notification.unread.success'));
        this.updateIsHidden();
      });
  }

  hide() {
    this.isProcessing$.next(true);
    this.notificationMenuService.hideNotification(this.contextMenuObject as Item)
      .pipe(take(1))
      .subscribe((response) => {
        this.isProcessing$.next(false);
        this.notificationsService.success(this.translateService.get('notification.read.success'));
        this.updateIsHidden();
      });
  }

  updateIsHidden() {
    this.notificationMenuService.isHiddenObs(this.contextMenuObject as Item).subscribe((isHidden) => {
      this.isHidden = isHidden;
    });
  }



}
