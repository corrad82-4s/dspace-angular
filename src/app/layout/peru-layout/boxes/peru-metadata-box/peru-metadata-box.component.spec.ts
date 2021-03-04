import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeruMetadataBoxComponent } from './peru-metadata-box.component';
import { MetadataComponentsDataService } from '../../../../core/layout/metadata-components-data.service';
import { MetadataComponentsDataServiceMock } from '../../../default-layout/boxes/metadata/cris-layout-metadata-box.component.spec';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CrisLayoutMetadataBoxComponent } from '../../../default-layout/boxes/metadata/cris-layout-metadata-box.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../../shared/mocks/translate-loader.mock';
import { PeruMetadataBoxService } from './peru-metadata-box.service';

describe('PeruMetadataBoxComponent', () => {
  let component: PeruMetadataBoxComponent;
  let componentAsAny: any;
  let peruMetadataBoxService: PeruMetadataBoxService;
  let fixture: ComponentFixture<PeruMetadataBoxComponent>;

  beforeEach(async () => {

    peruMetadataBoxService = new PeruMetadataBoxService();

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      })],
      declarations: [ PeruMetadataBoxComponent ],
      providers: [
        { provide: MetadataComponentsDataService, useClass: MetadataComponentsDataServiceMock },
        { provide: PeruMetadataBoxService, useValue: peruMetadataBoxService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeruMetadataBoxComponent);
    component = fixture.componentInstance;
    componentAsAny = component;

    // This allow us to spy over the super implementation
    spyOn(CrisLayoutMetadataBoxComponent.prototype, 'ngOnInit').and.returnValue(null);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setMetadataComponents', () => {

    const metadatacomponents: any = 'metadatacomponents';
    const itemSource: any = 'itemSource';
    const item: any = 'item';
    const patchedMetadatacomponents: any = 'patchedMetadatacomponents';

    beforeEach(() => {
      spyOn(peruMetadataBoxService, 'patchedMetadataComponent').and.returnValue(patchedMetadatacomponents);
      componentAsAny.item = item;
    });

    it('should patch when itemSource is present', () => {

      componentAsAny.itemSource = itemSource;

      componentAsAny.setMetadataComponents(metadatacomponents);

      expect(peruMetadataBoxService.patchedMetadataComponent).toHaveBeenCalledWith(metadatacomponents, item, itemSource);
      expect(componentAsAny.metadatacomponents).toBe(patchedMetadatacomponents);
    });

    it('should not patch when itemSource is not present', () => {

      componentAsAny.setMetadataComponents(metadatacomponents);

      expect(peruMetadataBoxService.patchedMetadataComponent).not.toHaveBeenCalled();
      expect(componentAsAny.metadatacomponents).toBe(metadatacomponents);
    });

  });

});
