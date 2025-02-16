import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactMeHelloComponent } from './contact-me-hello.component';

describe('ContactMeHelloComponent', () => {
  let component: ContactMeHelloComponent;
  let fixture: ComponentFixture<ContactMeHelloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactMeHelloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactMeHelloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
