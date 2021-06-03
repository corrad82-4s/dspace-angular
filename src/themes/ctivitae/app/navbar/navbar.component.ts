import { Component } from '@angular/core';
import { NavbarComponent as BaseComponent } from '../../../../app/navbar/navbar.component';
import { slideMobileNav } from '../../../../app/shared/animations/slide';

/**
 * Component representing the public navbar
 */
@Component({
  selector: 'ds-navbar',
  styleUrls: ['../../../peru/app/navbar/navbar.component.scss'],
  templateUrl: '../../../peru/app/navbar/navbar.component.html',
  animations: [slideMobileNav]
})
export class NavbarComponent extends BaseComponent {

  logoSrc(): string {
    return 'assets/images/logo_dina_alta.png';
  }
}
