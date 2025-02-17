import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailGroupComponent } from './project-detail-group.component';

describe('ProjectDetailGroupComponent', () => {
  let component: ProjectDetailGroupComponent;
  let fixture: ComponentFixture<ProjectDetailGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
