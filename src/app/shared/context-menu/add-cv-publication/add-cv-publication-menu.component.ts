import { Component, Inject, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { ConfigurationDataService } from 'src/app/core/data/configuration-data.service';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { rendersContextMenuEntriesForType } from '../context-menu.decorator';

@Component({
  selector: 'ds-context-menu-add-cv-publication',
  templateUrl: './add-cv-publication-menu.component.html'
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class AddCvPublicationMenuComponent extends ContextMenuEntryComponent implements OnInit {

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

  getCvPublicationCollectionId(): Observable<any> {
    return this.configurationDataService.findByPropertyName('researcher-profile.publication.collection.uuid').pipe(
      getFirstSucceededRemoteDataPayload(),
      map((configurationProperty) => { return { 'collection': configurationProperty.values[0] }; })
    );
  }

}
