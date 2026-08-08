import { PhotoEditorComponent } from '@admin/components/shared/photo-editor/photo-editor.component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TECH_SKILL_CATEGORY_OPTIONS, TechSkillCategory } from '@core/enum/tech-skills/tech-skill-category.enum';
import { IApiTechSkill } from '@core/interfaces/content/content.interface';
import { IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { ContentService } from '@core/services/content/content.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import {
  AlertModule,
  ButtonModule,
  CardModule,
  FormModule,
} from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';
import { ShowErrorsComponent } from '../../components/shared/show-errors/show-errors.component';

type SkillFormMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-skill-form-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AlertModule,
    ButtonModule,
    CardModule,
    FormModule,
    PhotoEditorComponent,
    ShowErrorsComponent,
  ],
  templateUrl: './skill-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './skill-form-page.component.scss',
})
export class AdminSkillFormPageComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);

  mode: SkillFormMode = 'create';
  skillId = '';
  loading = false;
  saving = false;
  notFound = false;
  error: string | null = null;
  draft: Partial<IApiTechSkill> = this.createEmptyDraft();
  readonly categoryOptions = TECH_SKILL_CATEGORY_OPTIONS;
  selectedCategory: TechSkillCategory | '' = '';

  async ngOnInit(): Promise<void> {
    this.mode = (this.route.snapshot.data['mode'] as SkillFormMode) || 'create';

    if (this.mode === 'create') {
      return;
    }

    this.skillId = this.route.snapshot.paramMap.get('id') || '';
    await this.loadSkill();
  }

  get pageTitle(): string {
    return this.mode === 'create' ? 'Crear skill' : 'Editar skill';
  }

  get pageCopy(): string {
    return this.mode === 'create'
      ? 'Crea una skill reutilizable para proyectos y secciones públicas.'
      : 'Actualiza label, icono y estado de la skill desde una vista dedicada.';
  }

  get statusLabel(): string {
    return this.draft.active ? 'Activa' : 'Inactiva';
  }

  get draftLabel(): string {
    return (
      this.draft.label?.es || this.draft.label?.en || this.draft.value || ''
    );
  }

  get iconAssets(): IProjectAsset[] {
    if (!this.draft.icon) {
      return [];
    }

    return [
      typeof this.draft.icon === 'string'
        ? { url: this.draft.icon }
        : this.draft.icon,
    ];
  }

  get previewUrls(): string[] {
    return this.iconAssets
      .map((asset) => resolveImageAssetUrl(asset))
      .filter((url): url is string => Boolean(url));
  }

  get iconStorageKey(): string {
    return `skill-form-${this.mode}-${this.skillId || 'new'}-icon`;
  }

  onLabelChange(value: string): void {
    const normalized = this.normalizeSkillLabel(value);
    this.draft.label = { es: normalized, en: normalized };
    this.draft.title = { es: normalized, en: normalized };
    this.draft.value = normalized;
  }

  onIconAssetsChange(assets: IProjectAsset[]): void {
    this.draft.icon = assets[0] ?? null;
    this.error = null;
  }

  onUploadError(message: string): void {
    this.error = message;
    this.toastr.error(message, 'Dashboard');
  }

  async submit(): Promise<void> {
    const normalized = this.normalizeSkillLabel(this.draftLabel);
    if (!normalized) {
      this.error = 'El nombre de la skill es obligatorio.';
      return;
    }
    if (!this.selectedCategory) {
      this.error = 'La categoría de la skill es obligatoria.';
      return;
    }

    this.onLabelChange(normalized);
    this.error = null;
    this.saving = true;

    try {
      const payload: Partial<IApiTechSkill> = {
        label: this.draft.label,
        title: this.draft.title,
        value: this.draft.value,
        icon: this.draft.icon ?? null,
        active: this.draft.active ?? true,
        metadata: { ...(this.draft.metadata ?? {}), category: this.selectedCategory },
      };

      if (this.mode === 'create') {
        await this.contentService.createContentItem<IApiTechSkill>(
          'techSkills',
          payload,
        );
        this.toastr.success('Skill creada.', 'Panel');
      } else if (this.skillId) {
        await this.contentService.updateContentItem<IApiTechSkill>(
          'techSkills',
          this.skillId,
          payload,
        );
        this.toastr.success('Skill actualizada.', 'Panel');
      }

      await this.router.navigate(['/admin/dashboard/skills']);
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'No se pudo guardar la skill.';
      this.toastr.error(this.error, 'Dashboard');
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  private async loadSkill(): Promise<void> {
    this.loading = true;

    try {
      const skills = await this.contentService.getTechSkills();
      const skill = skills.find((item) => item._id === this.skillId);

      if (!skill) {
        this.notFound = true;
        return;
      }

      this.draft = structuredClone(skill);
      this.selectedCategory = skill.metadata?.category ?? '';
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'No se pudo cargar la skill.';
      this.toastr.error(this.error, 'Dashboard');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private createEmptyDraft(): Partial<IApiTechSkill> {
    return {
      label: { es: '', en: '' },
      title: { es: '', en: '' },
      value: '',
      icon: null,
      active: true,
      metadata: {},
    };
  }

  private normalizeSkillLabel(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
