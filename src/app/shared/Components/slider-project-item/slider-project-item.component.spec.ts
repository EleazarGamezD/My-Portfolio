import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderProjectItemComponent } from './slider-project-item.component';

describe('SliderProjectItemComponent', () => {
  let component: SliderProjectItemComponent;
  let fixture: ComponentFixture<SliderProjectItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderProjectItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SliderProjectItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
