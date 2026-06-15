import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import {
  ButtonModule,
  CardModule,
  FormModule,
  SpinnerModule,
} from '@coreui/angular';
import {
  Language,
  TranslateButtonComponent,
} from '../../components/shared/translate-button/translate-button.component';

@Component({
  selector: 'app-admin-contact-me-page',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    FormModule,
    SpinnerModule,
    TranslateButtonComponent,
  ],
  templateUrl: './contact-me-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './contact-me-page.component.scss',
})
export class AdminContactMePageComponent implements OnInit {
  readonly Language = Language;
  readonly titleMaxLength = 160;
  readonly bodyMaxLength = 520;
  translateErrors: Record<string, string> = {};

  constructor(
    public readonly facade: AdminDashboardFacade,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.facade.loadProfileContent();
    this.ensureContactContent();
    this.changeDetectorRef.detectChanges();
  }

  ensureContactContent(): void {
    if (!this.facade.profile) {
      return;
    }

    this.facade.profile.metadata ??= {};
    this.facade.profile.metadata.contactIntroTitle ??= { es: '', en: '' };
    this.facade.profile.metadata.contactIntro ??= { es: '', en: '' };
  }

  get contactTitleEs(): string {
    return this.facade.profile?.metadata?.contactIntroTitle?.es ?? '';
  }

  set contactTitleEs(value: string) {
    this.ensureContactIntroTitle();
    this.facade.profile!.metadata!.contactIntroTitle!.es = value;
  }

  get contactTitle(): string {
    return (
      this.facade.profile?.metadata?.contactIntroTitle?.es ??
      this.facade.profile?.metadata?.contactIntroTitle?.en ??
      ''
    );
  }

  set contactTitle(value: string) {
    this.ensureContactIntroTitle();
    this.facade.profile!.metadata!.contactIntroTitle!.es = value;
    this.facade.profile!.metadata!.contactIntroTitle!.en = value;
  }

  get contactBodyEs(): string {
    return this.facade.profile?.metadata?.contactIntro?.es ?? '';
  }

  set contactBodyEs(value: string) {
    this.ensureContactContent();
    this.facade.profile!.metadata!.contactIntro!.es = value;
  }

  get contactBodyEn(): string {
    return this.facade.profile?.metadata?.contactIntro?.en ?? '';
  }

  set contactBodyEn(value: string) {
    this.ensureContactContent();
    this.facade.profile!.metadata!.contactIntro!.en = value;
  }

  async save(): Promise<void> {
    this.ensureContactContent();
    await this.facade.saveProfile();
  }

  private ensureContactIntroTitle(): void {
    this.ensureContactContent();
  }
}
