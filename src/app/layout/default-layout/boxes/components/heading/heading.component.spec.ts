import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadingComponent } from './heading.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateLoaderMock } from 'src/app/shared/mocks/translate-loader.mock';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Item } from 'src/app/core/shared/item.model';
import { medataComponent } from 'src/app/shared/testing/metadata-components.mock';
import { By } from '@angular/platform-browser';

class TestItem {
  firstMetadataValue(key: string): string {
    return 'Danilo Di Nuzzo';
  }
}

describe('HeadingComponent', () => {
  let component: HeadingComponent;
  let fixture: ComponentFixture<HeadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      }), BrowserAnimationsModule],
      declarations: [ HeadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadingComponent);
    component = fixture.componentInstance;
    component.item = new TestItem() as Item;
    component.field = medataComponent.rows[0].fields[0];
    fixture.detectChanges();
  });

  it('check heading rendering', () => {
    const divFound = fixture.debugElement.query(By.css('div.h2'));
    const div: HTMLElement = divFound.nativeElement;
    expect(div.textContent).toContain((new TestItem()).firstMetadataValue(''));
  });
});
