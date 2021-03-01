import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../shared/mocks/translate-loader.mock';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SourcesOfInformationComponent } from './sources-of-information.component';
import { SourcesOfInformationService } from '../services/sources-of-information.service';

describe('SourcesOfInformationComponent', () => {
  let component: SourcesOfInformationComponent;
  let fixture: ComponentFixture<SourcesOfInformationComponent>;
  let sourcesOfInformationService: SourcesOfInformationService;

  beforeEach(async () => {
    sourcesOfInformationService = new SourcesOfInformationService(null, null, null, null);
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      })],
      declarations: [ SourcesOfInformationComponent ],
      providers: [ { provide: SourcesOfInformationService, useValue: sourcesOfInformationService }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SourcesOfInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
