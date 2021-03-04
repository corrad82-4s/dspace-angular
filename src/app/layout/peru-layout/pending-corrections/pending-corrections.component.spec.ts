import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { PendingCorrectionsComponent } from './pending-corrections.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PendingCorrectionService } from '../services/pending-correction.service';
import { of } from 'rxjs/internal/observable/of';
import { Item } from '../../../core/shared/item.model';

const item = Object.assign(new Item(), {
  metadata: {
    'dc.contributor.author': [{
      value: 'test item'
    }]
  }
});

describe('PendingCorrectionsComponent', () => {
  let component: PendingCorrectionsComponent;
  let fixture: ComponentFixture<PendingCorrectionsComponent>;
  let pendingCorrectionService: PendingCorrectionService;

  beforeEach(async () => {
    pendingCorrectionService = new PendingCorrectionService(null, null,);
    await TestBed.configureTestingModule({
      declarations: [ PendingCorrectionsComponent ],
      providers: [ { provide: PendingCorrectionService, useValue: pendingCorrectionService }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingCorrectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getCorrectionItems with item', fakeAsync(() => {

    const correctionItems: any = ['correctionItems'];
    component.item = item;
    spyOn(pendingCorrectionService, 'getCorrectionItems').and.returnValue(of(correctionItems));

    component.ngOnInit();

    tick();

    expect(component.correctionItems).toBe(correctionItems);
  }));
});
