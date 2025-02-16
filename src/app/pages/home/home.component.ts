import { Component } from '@angular/core';
import { CareerPathComponent } from '../../shared/Components/career-path/career-path.component';
import { ContactMeHelloComponent } from '../../shared/Components/contact-me-hello/contact-me-hello.component';
import { ContactMeComponent } from '../../shared/Components/contact-me/contact-me.component';
import { CvComponent } from '../../shared/Components/cv/cv.component';
import { FeaturesComponent } from '../../shared/Components/features/features.component';
import { HomeBannerSliderComponent } from '../../shared/Components/home-banner-slider/home-banner-slider.component';
import { SliderProjectsComponent } from '../../shared/Components/slider-projects/slider-projects.component';
import { SmallAboutResumeComponent } from '../../shared/Components/small-about-resume/small-about-resume.component';
import { WorkReferencesComponent } from '../../shared/Components/work-references/work-references.component';

@Component({
  selector: 'app-home',
  imports: [
    HomeBannerSliderComponent,
    FeaturesComponent,
    SmallAboutResumeComponent,
    SliderProjectsComponent,
    CareerPathComponent,
    WorkReferencesComponent,
    ContactMeHelloComponent,
    ContactMeComponent,
    CvComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
