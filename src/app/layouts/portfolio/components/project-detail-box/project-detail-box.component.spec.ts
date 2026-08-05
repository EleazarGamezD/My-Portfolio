import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailBoxComponent } from './project-detail-box.component';

describe('ProjectDetailBoxComponent', () => {
  let component: ProjectDetailBoxComponent;
  let fixture: ComponentFixture<ProjectDetailBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
