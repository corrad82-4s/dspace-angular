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

@Component({
  selector: 'ds-context-menu-hide-notification',
  templateUrl: './hide-notification-menu.component.html',
  providers: [NotificationMenuService]
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class HideNotificationMenuComponent extends ContextMenuEntryComponent implements OnInit {

  public modalRef: NgbModalRef;

  public isHidden$: Observable<boolean>;

  public isProcessing$: Subject<boolean> = new Subject<boolean>();

  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    protected configurationDataService: ConfigurationDataService,
    protected notificationMenuService: NotificationMenuService
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType);
  }

  ngOnInit(): void {
    this.isHidden$ = this.notificationMenuService.isHiddenObs(this.contextMenuObject as Item);
  }

  show() {
    this.isProcessing$.next(true);
    this.notificationMenuService.showNotification(this.contextMenuObject as Item)
      .pipe(take(1))
      .subscribe((response) => {
        this.isProcessing$.next(false);
      });
  }

  hide() {
    this.isProcessing$.next(true);
    this.notificationMenuService.hideNotification(this.contextMenuObject as Item)
      .pipe(take(1))
      .subscribe((response) => {
        this.isProcessing$.next(false);
      });
  }



}
