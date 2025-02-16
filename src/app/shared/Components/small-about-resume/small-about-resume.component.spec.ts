import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallAboutResumeComponent } from './small-about-resume.component';

describe('SmallAboutResumeComponent', () => {
  let component: SmallAboutResumeComponent;
  let fixture: ComponentFixture<SmallAboutResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmallAboutResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmallAboutResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
