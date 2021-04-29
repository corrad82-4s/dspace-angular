import { Component } from '@angular/core';

import { FieldRendetingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { RenderingTypeModelComponent } from '../rendering-type.model';
import { TextComponent } from '../text/text.component';

/**
 * This component renders the text metadata fields
 */
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'span[ds-text-verified]',
  templateUrl: './text-verified.component.html',
  styleUrls: ['../text/text.component.scss']
})
@MetadataBoxFieldRendering(FieldRendetingType.TEXTVERIFIED)
export class TextVerifiedComponent extends TextComponent {

}
