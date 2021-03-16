import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { SubmissionService } from 'src/app/submission/submission.service';
import { ConfigurationDataService } from '../../../core/data/configuration-data.service';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { rendersContextMenuEntriesForType } from '../context-menu.decorator';

@Component({
  selector: 'ds-context-menu-modify-for-profile',
  templateUrl: './modify-for-profile-menu.component.html'
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class ModifyForProfileMenuComponent extends ContextMenuEntryComponent implements OnInit {

  public modalRef: NgbModalRef;

  private isProfileRelatedEntityChangeEnabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    protected configurationDataService: ConfigurationDataService,
    protected submissionService: SubmissionService,
    protected router: Router
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType);
  }

  ngOnInit(): void {
    this.isProfileRelatedEntityChangeEnabled$.next(true);
  }

  isProfileRelatedEntityChangeEnabled(): Observable<boolean> {
    return this.isProfileRelatedEntityChangeEnabled$;
  }

  modify(): void {

  }

}
