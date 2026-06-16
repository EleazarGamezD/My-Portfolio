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
import { SkillPickerComponent } from '../../components/shared/skill-picker/skill-picker.component';
import { ShowErrorsComponent } from '../../components/shared/show-errors/show-errors.component';
import { ToastrService } from 'ngx-toastr';

type ExperienceFormMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-experience-form-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AlertModule,
    ButtonModule,
    CardModule,
    FormModule,
    TranslateButtonComponent,
    SkillPickerComponent,
    ShowErrorsComponent,
  ],
  templateUrl: './experience-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './experience-form-page.component.scss',
})
export class AdminExperienceFormPageComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly Language = Language;
  mode: ExperienceFormMode = 'create';
  experienceId = '';
  loading = false;
  saving = false;
  notFound = false;
  error: string | null = null;
  draft: Partial<IApiContentItem> = this.createEmptyDraft();
  translateErrors: Record<string, string> = {};

  /** Selected skill IDs for this experience entry */
  selectedSkillIds: string[] = [];

  async ngOnInit(): Promise<void> {
    this.mode =
      (this.route.snapshot.data['mode'] as ExperienceFormMode) || 'create';
    if (this.mode === 'edit') {
      await this.loadExperience();
    }
  }

  get pageTitle(): string {
    return this.mode === 'create'
      ? 'Crear experiencia laboral'
      : 'Editar experiencia laboral';
  }

  get pageCopy(): string {
    return this.mode === 'create'
      ? 'Crea una nueva entrada de experiencia para la linea profesional del portfolio.'
      : 'Actualiza el contenido de la experiencia. El orden visual se administra desde el listado con drag and drop.';
  }

  get isCurrentRole(): boolean {
    return this.draft.period?.current === true;
  }

  get companyName(): string {
    return this.draft.label?.es?.trim() || this.draft.label?.en?.trim() || '';
  }

  onCompanyNameChange(value: string): void {
    const normalized = value.trimStart();
    this.draft.label ??= { es: '', en: '' };
    this.draft.title ??= { es: '', en: '' };
    this.draft.label.es = normalized;
    this.draft.label.en = normalized;
    this.draft.title.es = normalized;
    this.draft.title.en = normalized;
  }

  onCurrentRoleChange(value: boolean): void {
    this.draft.period ??= {};
    this.draft.period.current = value;
    if (value) {
      this.draft.period.end = null;
    }
  }

  onSkillsChange(ids: string[]): void {
    this.selectedSkillIds = ids;
  }

  async submit(): Promise<void> {
    const companyName = this.companyName.trim();
    const periodStart = this.draft.period?.start?.trim() || '';
    const periodEnd = this.draft.period?.end?.trim() || '';
    const periodCurrent = this.draft.period?.current === true;

    if (!companyName || !periodStart || (!periodCurrent && !periodEnd)) {
      this.error = 'Nombre de la empresa y periodo son obligatorios.';
      return;
    }

    this.saving = true;
    this.error = null;

    try {
      let order = this.draft.order ?? 0;
      if (this.mode === 'create') {
        const existingItems = await this.contentService.getExperience();
        order = existingItems.length + 1;
      }

      const payload: Partial<IApiContentItem> = {
        label: { es: companyName, en: companyName },
        title: { es: companyName, en: companyName },
        description: {
          es: this.draft.description?.es?.trim() || '',
          en: this.draft.description?.en?.trim() || '',
        },
        value: periodCurrent
          ? `${periodStart} - Actual`
          : `${periodStart} - ${periodEnd}`,
        period: {
          start: periodStart,
          end: periodCurrent ? null : periodEnd,
          current: periodCurrent,
        },
        order,
        active: true,
        metadata: {
          ...(this.draft.metadata ?? {}),
          skillIds: this.selectedSkillIds,
        },
      };

      if (this.mode === 'create') {
        await this.contentService.createContentItem<IApiContentItem>(
          'experience',
          payload,
        );
        this.toastr.success('Experiencia creada.', 'Panel');
      } else if (this.experienceId) {
        await this.contentService.updateContentItem<IApiContentItem>(
          'experience',
          this.experienceId,
          payload,
        );
        this.toastr.success('Experiencia actualizada.', 'Panel');
      }

      await this.router.navigate(['/admin/dashboard/experience']);
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la experiencia.';
      this.toastr.error(this.error, 'Dashboard');
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  private async loadExperience(): Promise<void> {
    this.experienceId = this.route.snapshot.paramMap.get('id') || '';
    this.loading = true;
    try {
      const items = await this.contentService.getExperience();
      const item = items.find((entry) => entry._id === this.experienceId);
      if (!item) {
        this.notFound = true;
        return;
      }
      this.draft = structuredClone(item);
      const metaSkillIds = item.metadata?.['skillIds'];
      if (Array.isArray(metaSkillIds)) {
        this.selectedSkillIds = metaSkillIds.filter(
          (id): id is string => typeof id === 'string',
        );
      }
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la experiencia.';
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
      value: '',
      period: { start: '', end: null, current: false },
      order: 0,
      active: true,
      metadata: {},
    };
  }
}
