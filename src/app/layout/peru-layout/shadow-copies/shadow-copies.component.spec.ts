import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShadowCopiesComponent } from './shadow-copies.component';
import { ShadowCopiesService } from './shadow-copies.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../shared/mocks/translate-loader.mock';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ShadowCopiesComponent', () => {
  let component: ShadowCopiesComponent;
  let fixture: ComponentFixture<ShadowCopiesComponent>;
  let shadowCopiesService: ShadowCopiesService;

  beforeEach(async () => {
    shadowCopiesService = new ShadowCopiesService(null, null, null, null);
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      })],
      declarations: [ ShadowCopiesComponent ],
      providers: [ { provide: ShadowCopiesService, useValue: shadowCopiesService }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShadowCopiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
