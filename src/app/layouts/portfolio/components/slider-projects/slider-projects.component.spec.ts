import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderProjectsComponent } from './slider-projects.component';

describe('SliderProjectsComponent', () => {
  let component: SliderProjectsComponent;
  let fixture: ComponentFixture<SliderProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SliderProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
