import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesBannerComponent } from './pages-banner.component';

describe('PagesBannerComponent', () => {
  let component: PagesBannerComponent;
  let fixture: ComponentFixture<PagesBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagesBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagesBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
