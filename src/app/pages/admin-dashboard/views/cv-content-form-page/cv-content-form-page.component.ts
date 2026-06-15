import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import {
  AlertModule,
  ButtonModule,
  CardModule,
  FormModule,
} from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';
import {
  Language,
  TranslateButtonComponent,
} from '../../components/shared/translate-button/translate-button.component';

type CvContentResource = 'education' | 'certifications';
type CvContentFormMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-cv-content-form-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AlertModule,
    ButtonModule,
    CardModule,
    FormModule,
    TranslateButtonComponent,
  ],
  templateUrl: './cv-content-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './cv-content-form-page.component.scss',
})
export class AdminCvContentFormPageComponent implements OnInit {
  readonly Language = Language;
  mode: CvContentFormMode = 'create';
  resource: CvContentResource = 'education';
  itemId = '';
  loading = false;
  saving = false;
  notFound = false;
  error: string | null = null;
  draft: Partial<IApiContentItem> = this.createEmptyDraft();
  translateErrors: Record<string, string> = {};

  constructor(
    private readonly contentService: ContentService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastr: ToastrService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.mode =
      (this.route.snapshot.data['mode'] as CvContentFormMode) || 'create';
    this.resource =
      (this.route.snapshot.data['resourceName'] as CvContentResource) ||
      'education';

    if (this.mode === 'edit') {
      await this.loadItem();
    }
  }

  get isEducation(): boolean {
    return this.resource === 'education';
  }

  get pageTitle(): string {
    if (this.isEducation) {
      return this.mode === 'create' ? 'Crear educacion' : 'Editar educacion';
    }

    return this.mode === 'create' ? 'Crear certificado' : 'Editar certificado';
  }

  get pageCopy(): string {
    return this.isEducation
      ? 'Carga estudios, institucion, periodo y enlace de respaldo para el CV generado.'
      : 'Carga certificados verificables con plataforma, fecha de emision, credencial y enlace.';
  }

  get backLink(): (string | number)[] {
    return ['/admin/dashboard', this.resource];
  }

  get eyebrow(): string {
    if (this.isEducation) {
      return this.mode === 'create' ? 'Nuevo estudio' : 'Edicion academica';
    }

    return this.mode === 'create'
      ? 'Nueva credencial'
      : 'Edicion de certificado';
  }

  get heroTitle(): string {
    return this.isEducation
      ? this.draft.title?.es || 'Define el estudio para el CV'
      : this.draft.title?.es || 'Define el certificado verificable';
  }

  get currentPeriod(): boolean {
    return this.draft.period?.current === true;
  }

  onCurrentPeriodChange(value: boolean): void {
    this.draft.period ??= {};
    this.draft.period.current = value;

    if (value) {
      this.draft.period.end = null;
    }
  }

  async submit(): Promise<void> {
    const labelEs = this.draft.label?.es?.trim() || '';
    const labelEn = this.draft.label?.en?.trim() || labelEs;
    const titleEs = this.draft.title?.es?.trim() || '';
    const titleEn = this.draft.title?.en?.trim() || titleEs;

    if (!labelEs || !titleEs) {
      this.error = this.isEducation
        ? 'Institucion y titulo/programa son obligatorios.'
        : 'Plataforma/emisor y certificado son obligatorios.';
      return;
    }

    if (this.isEducation) {
      const start = this.draft.period?.start?.trim() || '';
      const end = this.draft.period?.end?.trim() || '';

      if (!start || (!this.currentPeriod && !end)) {
        this.error =
          'Fecha inicio y fecha fin son obligatorias, salvo que marques cursando.';
        return;
      }
    }

    this.saving = true;
    this.error = null;

    try {
      let order = this.draft.order ?? 0;
      if (this.mode === 'create') {
        const existingItems = await this.loadItemsByResource();
        order = existingItems.length + 1;
      }

      const payload = this.isEducation
        ? this.buildEducationPayload(labelEs, labelEn, titleEs, titleEn, order)
        : this.buildCertificationPayload(
            labelEs,
            labelEn,
            titleEs,
            titleEn,
            order,
          );

      if (this.mode === 'create') {
        await this.contentService.createContentItem<IApiContentItem>(
          this.resource,
          payload,
        );
        this.toastr.success(
          this.isEducation ? 'Educacion creada.' : 'Certificado creado.',
          'Panel',
        );
      } else if (this.itemId) {
        await this.contentService.updateContentItem<IApiContentItem>(
          this.resource,
          this.itemId,
          payload,
        );
        this.toastr.success(
          this.isEducation
            ? 'Educacion actualizada.'
            : 'Certificado actualizado.',
          'Panel',
        );
      }

      await this.router.navigate(this.backLink);
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el contenido.';
      this.toastr.error(this.error, 'Dashboard');
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  private buildEducationPayload(
    labelEs: string,
    labelEn: string,
    titleEs: string,
    titleEn: string,
    order: number,
  ): Partial<IApiContentItem> {
    const periodStart = this.draft.period?.start?.trim() || '';
    const periodEnd = this.draft.period?.end?.trim() || '';

    return {
      label: { es: labelEs, en: labelEn },
      title: { es: titleEs, en: titleEn },
      description: {
        es: this.draft.description?.es?.trim() || '',
        en: this.draft.description?.en?.trim() || '',
      },
      value: this.currentPeriod
        ? `${periodStart} - Actual`
        : `${periodStart} - ${periodEnd}`,
      period: {
        start: periodStart,
        end: this.currentPeriod ? null : periodEnd,
        current: this.currentPeriod,
      },
      href: this.draft.href?.trim() || '',
      order,
      active: this.draft.active ?? true,
      metadata: this.draft.metadata ?? {},
    };
  }

  private buildCertificationPayload(
    labelEs: string,
    labelEn: string,
    titleEs: string,
    titleEn: string,
    order: number,
  ): Partial<IApiContentItem> {
    const metadata = { ...(this.draft.metadata ?? {}) };
    delete metadata['platform'];
    delete metadata['issuer'];

    return {
      label: { es: labelEs, en: labelEn },
      title: { es: titleEs, en: titleEn },
      href: this.draft.href?.trim() || '',
      order,
      active: this.draft.active ?? true,
      metadata: {
        ...metadata,
        issuedAt:
          typeof metadata['issuedAt'] === 'string'
            ? metadata['issuedAt'].trim()
            : '',
        credentialId:
          typeof metadata['credentialId'] === 'string'
            ? metadata['credentialId'].trim()
            : '',
      },
    };
  }

  private async loadItem(): Promise<void> {
    this.itemId = this.route.snapshot.paramMap.get('id') || '';
    this.loading = true;

    try {
      const items = await this.loadItemsByResource();
      const item = items.find((entry) => entry._id === this.itemId);

      if (!item) {
        this.notFound = true;
        return;
      }

      this.draft = structuredClone(item);
      this.draft.metadata ??= {};
      this.draft.period ??= { start: '', end: null, current: false };
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el contenido.';
      this.toastr.error(this.error, 'Dashboard');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private async loadItemsByResource(): Promise<IApiContentItem[]> {
    return this.isEducation
      ? this.contentService.getEducation()
      : this.contentService.getCertifications();
  }

  private createEmptyDraft(): Partial<IApiContentItem> {
    return {
      label: { es: '', en: '' },
      title: { es: '', en: '' },
      description: { es: '', en: '' },
      period: { start: '', end: null, current: false },
      href: '',
      order: 0,
      active: true,
      metadata: {},
    };
  }
}
