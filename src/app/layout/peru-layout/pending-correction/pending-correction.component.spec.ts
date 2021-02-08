import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { PendingCorrectionComponent } from './pending-correction.component';
import { PendingCorrectionService } from './pending-correction.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Item } from '../../../core/shared/item.model';
import { of } from 'rxjs/internal/observable/of';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../shared/mocks/translate-loader.mock';

const item = Object.assign(new Item(), {
  metadata: {
    'dc.contributor.author': [{
      value: 'test item'
    }]
  }
});

describe('PendingCorrectionComponent', () => {
  let component: PendingCorrectionComponent;
  let fixture: ComponentFixture<PendingCorrectionComponent>;
  let pendingCorrectionService: PendingCorrectionService;

  beforeEach(async () => {
    pendingCorrectionService = new PendingCorrectionService(null, null, null, null);
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      })],
      declarations: [ PendingCorrectionComponent ],
      providers: [ { provide: PendingCorrectionService, useValue: pendingCorrectionService }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getCorrectionItem with item', fakeAsync(() => {

    const correctionItem: any = 'correctionItem';
    component.item = item;
    spyOn(pendingCorrectionService, 'getCorrectionItem').and.returnValue(of(correctionItem));

    component.ngOnInit();

    tick();

    expect(component.correctionItem).toBe(correctionItem);
  }));
});
