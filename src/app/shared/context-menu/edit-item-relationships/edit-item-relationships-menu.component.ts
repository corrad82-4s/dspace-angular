import { Component, Inject, OnDestroy, OnInit } from '@angular/core';

import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import { map, mergeMap, startWith } from 'rxjs/operators';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { hasValue, isNotEmpty } from '../../empty.util';
import { EditItemMode } from '../../../core/submission/models/edititem-mode.model';
import { followLink } from '../../utils/follow-link-config.model';
import { getAllSucceededRemoteDataPayload, getFirstSucceededRemoteListPayload } from '../../../core/shared/operators';
import { EditItem } from '../../../core/submission/models/edititem.model';
import { EditItemDataService } from '../../../core/submission/edititem-data.service';
import { rendersContextMenuEntriesForType } from '../context-menu.decorator';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { TabDataService } from '../../../core/layout/tab-data.service';
import { Tab } from '../../../core/layout/models/tab.model';
import { BoxDataService } from '../../../core/layout/box-data.service';
import { Box } from '../../../core/layout/models/box.model';

/**
 * This component renders a context menu option that provides the links to edit item page.
 */
@Component({
  selector: 'ds-context-menu-edit-item-relationships',
  templateUrl: './edit-item-relationships-menu.component.html'
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class EditItemRelationshipsMenuComponent extends ContextMenuEntryComponent implements OnInit, OnDestroy {

  /**
   * A boolean representing if a request operation is pending
   * @type {BehaviorSubject<boolean>}
   */
  public processing$ = new BehaviorSubject<boolean>(false);

  /**
   * Reference to NgbModal
   */
  public modalRef: NgbModalRef;

  /**
   * List of Edit Modes available on this item
   * for the current user
   */
  private editModes$: BehaviorSubject<EditItemMode[]> = new BehaviorSubject<EditItemMode[]>([]);

  /**
   * List of subscriptions
   */
  subs: Subscription[] = [];

  /**
   * Tabs
   */
  private tabs: Tab[];


  relationshipTypes = [];

  public relationships = [];

  /**
   * Initialize instance variables
   *
   * @param {DSpaceObject} injectedContextMenuObject
   * @param {DSpaceObjectType} injectedContextMenuObjectType
   * @param {EditItemDataService} editItemService
   */
  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    private editItemService: EditItemDataService,
    protected tabService: TabDataService,
    protected boxService: BoxDataService,
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType);
  }
  /**
   * Get edit modes from context id
   * Get tabs from the context id and get boxes of tabs
   */
  ngOnInit(): void {
    // Retrieve edit modes
    this.subs.push(this.editItemService.findById(this.contextMenuObject.id + ':none', true, true, followLink('modes')).pipe(
      getAllSucceededRemoteDataPayload(),
      mergeMap((editItem: EditItem) => editItem.modes.pipe(
        getFirstSucceededRemoteListPayload())
      ),
      startWith([])
    ).subscribe((editModes: EditItemMode[]) => {
      this.editModes$.next(editModes);
    }));

    // Retrieve tabs by UUID of item
    this.subs.push(this.tabService.findByItem(this.contextMenuObject.id).pipe(
      getFirstSucceededRemoteListPayload()
    ).subscribe( (tabs) => {
      this.tabs = tabs;
      this.initBoxes();
    }));

  }

  /**
   * Get boxes from tabs
   */
  initBoxes(): void {
    this.tabs.forEach( (tab) => {
      this.getBox(tab);
    });
  }

  /**
   * If boxes type is equal Relation add them to the list of relations to be managed
   */
  getBox(tab): void {
    this.subs.push(this.boxService.findByItem(this.contextMenuObject.id, tab.id)
      .pipe(getFirstSucceededRemoteListPayload())
      .subscribe( (boxes: Box[]) => {
        // for PGC customization, notifications are handled in a different way, 'selected' and 'notifications' should be excluded
        // FIXME: a allow/deny list can be useful to decide which boxes are included in manage feature
        const relationshipsBoxes = boxes.filter( (box) => box.boxType === 'RELATION' && !box.shortname.includes('notifications') && !box.shortname.includes('selected') && !box.shortname.includes('hrprofiles'));
        this.relationships.push(...relationshipsBoxes);
      }));
  }

  /**
   * Check if edit mode is available
   */
  getEditModes(): Observable<EditItemMode[]> {
    return this.editModes$;
  }

  /**
   * Check if edit mode is available
   */
  isEditAvailable(): Observable<boolean> {
    // PGC customization, management available, right now, only for CvPerson entities
    if (this.contextMenuObject.firstMetadataValue('dspace.entity.type') !== 'CvPerson') {
      return of(false);
    }
    return this.editModes$.asObservable().pipe(
      map((editModes) => isNotEmpty(editModes) && editModes.length > 0)
    );
  }


  /**
   * Make sure the subscription is unsubscribed from when this component is destroyed
   */
  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach( (sub) => sub.unsubscribe());
  }
}