import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeSwiperSlideElementComponent } from './home-swiper-slide-element.component';

describe('HomeSwiperSlideElementComponent', () => {
  let component: HomeSwiperSlideElementComponent;
  let fixture: ComponentFixture<HomeSwiperSlideElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeSwiperSlideElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeSwiperSlideElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
