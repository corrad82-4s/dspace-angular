import { TestBed } from '@angular/core/testing';
import { PeruMetadataBoxService } from './peru-metadata-box.service';
import { Item } from '../../../../core/shared/item.model';
import { MedataComponentMock } from '../../../../core/layout/metadata-components-data.service.spec';
import { ItemSource } from '../../../../core/item-sources/model/item-sources.model';

const item = Object.assign(new Item(), {
  metadata: {
    'dc.contributor.author': [{
      value: 'test item'
    }]
  }
});

const itemSource: ItemSource = {
  itemUuid: null,
  relationshipType: null,
  source: null,
  metadata: ['dc.title']
};

const metadatacomponents = MedataComponentMock;

describe('PeruMetadataBoxService', () => {
  let service: PeruMetadataBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeruMetadataBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should apply styles to patched metadata', () => {

    const patchedMetadataComponent = service.patchedMetadataComponent(metadatacomponents, item, itemSource);

    expect(patchedMetadataComponent.rows[0].fields[0].styleValue.includes('not-shadowed-metadata')).toBeTrue();
  });

});
