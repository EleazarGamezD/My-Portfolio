import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkReferencesComponent } from './work-references.component';

describe('WorkReferencesComponent', () => {
  let component: WorkReferencesComponent;
  let fixture: ComponentFixture<WorkReferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkReferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
