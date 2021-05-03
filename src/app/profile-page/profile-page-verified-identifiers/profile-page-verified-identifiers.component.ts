import { Component, Input } from '@angular/core';
import { EPerson } from '../../core/eperson/models/eperson.model';

@Component({
  selector: 'ds-profile-page-verified-identifiers',
  templateUrl: './profile-page-verified-identifiers.component.html',
  styleUrls: ['./profile-page-verified-identifiers.component.scss']
})
export class ProfilePageVerifiedIdentifiersComponent {

  @Input() user: EPerson;

  get orcid() {
    return this.user.firstMetadataValue('perucris.eperson.orcid');
  }

  get dni() {
    return this.user.firstMetadataValue('perucris.eperson.dni');
  }

}
