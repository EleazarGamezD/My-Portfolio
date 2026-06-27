import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StorageService } from '@services/storage/storage.service';
import { ToastrService } from 'ngx-toastr';

import { AddPhotoComponent } from './add-photo.component';

describe('AddPhotoComponent', () => {
  let component: AddPhotoComponent;
  let fixture: ComponentFixture<AddPhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPhotoComponent],
      providers: [
        {
          provide: StorageService,
          useValue: {
            getStorage: () => Promise.resolve([]),
            setStorage: () => Promise.resolve(),
          },
        },
        {
          provide: ToastrService,
          useValue: {
            error: () => undefined,
            success: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPhotoComponent);
    fixture.componentRef.setInput('persistDraft', false);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
