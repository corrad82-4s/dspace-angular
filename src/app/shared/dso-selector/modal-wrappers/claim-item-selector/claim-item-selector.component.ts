import { EPerson } from './../../../../core/eperson/models/eperson.model';
import { ProfileClaimService } from './../../../../profile-page/profile-claim/profile-claim.service';
import { getItemPageRoute } from './../../../../+item-page/item-page-routing-paths';
import { CollectionElementLinkType } from './../../../../shared/object-collection/collection-element-link.type';
import { ViewMode } from './../../../../core/shared/view-mode.model';
import { DSpaceObject } from './../../../../core/shared/dspace-object.model';
import { Component, OnInit } from '@angular/core';
import { DSOSelectorModalWrapperComponent } from '../dso-selector-modal-wrapper.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RemoteData } from '../../../../core/data/remote-data';
import { PaginatedList } from '../../../../core/data/paginated-list.model';
import { SearchResult } from '../../../search/search-result.model';
import { Input } from '@angular/core';
import { getFirstSucceededRemoteDataPayload } from '../../../../core/shared/operators';
import { switchMap } from 'rxjs/operators';
import { Item } from '../../../../core/shared/item.model';



@Component({
  selector: 'ds-claim-item-selector',
  templateUrl: './claim-item-selector.component.html'
})
export class ClaimItemSelectorComponent extends DSOSelectorModalWrapperComponent implements OnInit {

  @Input() dso: DSpaceObject;

  listEntries$: BehaviorSubject<RemoteData<PaginatedList<SearchResult<DSpaceObject>>>> =  new BehaviorSubject(null);

  viewMode = ViewMode.ListElement;

  // enum to be exposed
  linkTypes = CollectionElementLinkType;

  constructor(protected activeModal: NgbActiveModal, protected route: ActivatedRoute, private router: Router,
              private profileClaimService: ProfileClaimService) {
    super(activeModal, route);
  }

  ngOnInit(): void {
    this.profileClaimService.search(this.dso as EPerson).subscribe(
      (result) => this.listEntries$.next(result)
    );
  }

  // triggered when an item is selected
  selectItem(dso: DSpaceObject): void {
    this.close();
    this.navigate(dso);
  }

  navigate(dso: DSpaceObject) {
    this.router.navigate([getItemPageRoute(dso as Item)]);
  }

  rejectAssociation(selectedDso: DSpaceObject): void {
    this.profileClaimService.rejectAssociation(this.dso as EPerson, selectedDso).pipe(
      getFirstSucceededRemoteDataPayload(),
      switchMap((eperson) => this.profileClaimService.search(eperson))
    ).subscribe(
      (result) => {
        this.listEntries$.next(result);
        if (result.payload.totalElements === 0) {
          this.close();
        }
      }
    );
  }

}
