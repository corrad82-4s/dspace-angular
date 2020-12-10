import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { Component, OnInit } from '@angular/core';
import {DSOSelectorModalWrapperComponent, SelectorActionType} from '../dso-selector-modal-wrapper.component';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {RemoteData} from '../../../../core/data/remote-data';
import {PaginatedList} from '../../../../core/data/paginated-list';
import {SearchResult} from '../../../search/search-result.model';
import { ProfileClaimService } from 'src/app/profile-page/profile-claim/profile-claim.service';
import { Input } from '@angular/core';
import { CollectionElementLinkType } from 'src/app/shared/object-collection/collection-element-link.type';
import { getItemPageRoute } from 'src/app/+item-page/item-page-routing-paths';

@Component({
  selector: 'ds-claim-item-selector',
  templateUrl: './claim-item-selector.component.html'
})
export class ClaimItemSelectorComponent extends DSOSelectorModalWrapperComponent implements OnInit {

  @Input() dso: DSpaceObject;

  listEntries$: Observable<RemoteData<PaginatedList<SearchResult<DSpaceObject>>>>;

  viewMode = ViewMode.ListElement;

  // enum to be exposed
  linkTypes = CollectionElementLinkType;

  constructor(protected activeModal: NgbActiveModal, protected route: ActivatedRoute, private router: Router,
              private profileClaimService: ProfileClaimService) {
    super(activeModal, route);
  }

  ngOnInit(): void {
    this.listEntries$ = this.profileClaimService.search(this.dso as EPerson);
  }

  // triggered when an item is selected
  selectItem(dso: DSpaceObject): void {
    this.close();
    this.navigate(dso);
  }

  navigate(dso: DSpaceObject) {
    this.router.navigate([getItemPageRoute(dso.uuid)]);
  }

}
