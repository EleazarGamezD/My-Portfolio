import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentService } from '@core/services/content/content.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { ContactMeComponent } from './contact-me.component';

describe('ContactMeComponent', () => {
  let component: ContactMeComponent;
  let fixture: ComponentFixture<ContactMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactMeComponent],
      providers: [
        {
          provide: ContentService,
          useValue: {
            getProfile: () => Promise.resolve(null),
          },
        },
        {
          provide: ReCaptchaV3Service,
          useValue: {
            execute: () => of('test-token'),
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

    fixture = TestBed.createComponent(ContactMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
