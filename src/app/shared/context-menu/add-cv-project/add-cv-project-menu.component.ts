import { Component, Inject, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { ConfigurationDataService } from '../../../core/data/configuration-data.service';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { rendersContextMenuEntriesForType } from '../context-menu.decorator';

@Component({
  selector: 'ds-context-menu-add-cv-project',
  templateUrl: './add-cv-project-menu.component.html'
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class AddCvProjectMenuComponent extends ContextMenuEntryComponent implements OnInit {

  public modalRef: NgbModalRef;

  private isCvProfile$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    protected configurationDataService: ConfigurationDataService
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType);
  }

  ngOnInit(): void {
    this.isCvProfile$.next(this.contextMenuObject.firstMetadataValue('relationship.type') === 'CvPerson');
  }

  isCvProfile(): Observable<boolean> {
    return this.isCvProfile$;
  }

  getCvProjectCollectionId(): Observable<any> {
    return this.configurationDataService.findByPropertyName('researcher-profile.project.collection.uuid').pipe(
      getFirstSucceededRemoteDataPayload(),
      map((configurationProperty) => { return { 'collection': configurationProperty.values[0] }; })
    );
  }

}
