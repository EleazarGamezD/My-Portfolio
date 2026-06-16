import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import {
  AlertModule,
  ButtonModule,
  CardModule,
  FormModule,
} from '@coreui/angular';
import { ContentService } from '@core/services/content/content.service';
import {
  Language,
  TranslateButtonComponent,
} from '../../components/shared/translate-button/translate-button.component';
import { ShowErrorsComponent } from '../../components/shared/show-errors/show-errors.component';
import { ToastrService } from 'ngx-toastr';

type TestimonialFormMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-testimonial-form-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AlertModule,
    ButtonModule,
    CardModule,
    FormModule,
    TranslateButtonComponent,
    ShowErrorsComponent,
  ],
  templateUrl: './testimonial-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './testimonial-form-page.component.scss',
})
export class AdminTestimonialFormPageComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly Language = Language;
  mode: TestimonialFormMode = 'create';
  testimonialId = '';
  loading = false;
  saving = false;
  notFound = false;
  error: string | null = null;
  draft: Partial<IApiContentItem> = this.createEmptyDraft();
  translateErrors: Record<string, string> = {};

  async ngOnInit(): Promise<void> {
    this.mode =
      (this.route.snapshot.data['mode'] as TestimonialFormMode) || 'create';

    if (this.mode === 'create') {
      return;
    }

    this.testimonialId = this.route.snapshot.paramMap.get('id') || '';
    await this.loadTestimonial();
  }

  get pageTitle(): string {
    return this.mode === 'create' ? 'Crear testimonio' : 'Editar testimonio';
  }

  get pageCopy(): string {
    return this.mode === 'create'
      ? 'Usa un formulario dedicado para crear una nueva referencia de cliente o colega.'
      : 'Actualiza el testimonio desde un formulario dedicado en lugar de editarlo dentro de la tabla.';
  }

  get personName(): string {
    const value = this.draft.name ?? this.draft.metadata?.['name'];
    return typeof value === 'string' ? value : '';
  }

  get personPosition(): string {
    const value = this.draft.position ?? this.draft.metadata?.['position'];
    return typeof value === 'string' ? value : '';
  }

  get personCompany(): string {
    const value = this.draft.company ?? this.draft.metadata?.['company'];
    return typeof value === 'string' ? value : '';
  }

  onNameChange(value: string): void {
    const nextValue = value.trimStart();
    this.ensureMetadata();
    this.draft.name = nextValue;
    this.draft.metadata!['name'] = nextValue;
    this.draft.label = { es: nextValue, en: nextValue };
    this.draft.title = { es: nextValue, en: nextValue };
  }

  onPositionChange(value: string): void {
    const nextValue = value.trimStart();
    this.ensureMetadata();
    this.draft.position = nextValue;
    this.draft.metadata!['position'] = nextValue;
  }

  onCompanyChange(value: string): void {
    const nextValue = value.trimStart();
    this.ensureMetadata();
    this.draft.company = nextValue;
    this.draft.metadata!['company'] = nextValue;
  }

  async submit(): Promise<void> {
    const name = this.personName.trim();
    const position = this.personPosition.trim();
    const company = this.personCompany.trim();
    const descriptionEs = this.draft.description?.es?.trim() || '';
    const descriptionEn = this.draft.description?.en?.trim() || '';

    if (!name || !position || !company || !descriptionEs || !descriptionEn) {
      this.error =
        'Nombre, cargo, empresa y testimonio en ambos idiomas son obligatorios.';
      return;
    }

    this.saving = true;
    this.error = null;

    try {
      let order = this.draft.order ?? 0;

      if (this.mode === 'create') {
        const existingItems = await this.contentService.getTestimonials();
        order = existingItems.length + 1;
      }

      const payload: Partial<IApiContentItem> = {
        label: { es: name, en: name },
        title: { es: name, en: name },
        description: {
          es: descriptionEs,
          en: descriptionEn,
        },
        name,
        position,
        company,
        active: this.draft.active ?? true,
        order,
        metadata: {
          name,
          position,
          company,
        },
      };

      if (this.mode === 'create') {
        await this.contentService.createContentItem<IApiContentItem>(
          'testimonials',
          payload,
        );
        this.toastr.success('Testimonio creado.', 'Panel');
      } else if (this.testimonialId) {
        await this.contentService.updateContentItem<IApiContentItem>(
          'testimonials',
          this.testimonialId,
          payload,
        );
        this.toastr.success('Testimonio actualizado.', 'Panel');
      }

      await this.router.navigate(['/admin/dashboard/testimonials']);
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el testimonio.';
      this.toastr.error(this.error, 'Dashboard');
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  private async loadTestimonial(): Promise<void> {
    this.loading = true;

    try {
      const items = await this.contentService.getTestimonials();
      const item = items.find((entry) => entry._id === this.testimonialId);

      if (!item) {
        this.notFound = true;
        return;
      }

      this.draft = structuredClone(item);
      this.ensureMetadata();
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el testimonio.';
      this.toastr.error(this.error, 'Dashboard');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private createEmptyDraft(): Partial<IApiContentItem> {
    return {
      label: { es: '', en: '' },
      title: { es: '', en: '' },
      description: { es: '', en: '' },
      name: '',
      position: '',
      company: '',
      active: true,
      order: 0,
      metadata: {
        name: '',
        position: '',
        company: '',
      },
    };
  }

  private ensureMetadata(): void {
    this.draft.metadata ??= {};
  }
}
