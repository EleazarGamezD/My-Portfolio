import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IApiTechSkill } from '@core/interfaces/content/content.interface';
import {
  IProject,
  IProjectAsset,
} from '@core/interfaces/projects/projects.interfaces';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { ProjectsService } from '@core/services/projects/projects.service';
import { StorageService } from '@core/services/storage/storage.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import {
  AlertModule,
  ButtonModule,
  CardModule,
  FormModule,
} from '@coreui/angular';
import { AddPhotoComponent } from '@pages/admin-dashboard/components/shared/add-photo/add-photo.component';
import { PhotoEditorComponent } from '@pages/admin-dashboard/components/shared/photo-editor/photo-editor.component';
import { SkillPickerComponent } from '@pages/admin-dashboard/components/shared/skill-picker/skill-picker.component';
import {
  Language,
  TranslateButtonComponent,
} from '@pages/admin-dashboard/components/shared/translate-button/translate-button.component';

type ProjectFormMode = 'create' | 'edit';

export enum ProjectStatusEnum {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Component({
  selector: 'app-admin-project-form-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AlertModule,
    ButtonModule,
    CardModule,
    FormModule,
    SkillPickerComponent,
    AddPhotoComponent,
    PhotoEditorComponent,
    TranslateButtonComponent,
  ],
  templateUrl: './project-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './project-form-page.component.scss',
})
export class AdminProjectFormPageComponent implements OnInit, OnDestroy {
  readonly Language = Language;
  readonly ProjectStatusEnum = ProjectStatusEnum;
  readonly projectStatusOptions = [
    { value: ProjectStatusEnum.DRAFT, label: 'Borrador' },
    { value: ProjectStatusEnum.PUBLISHED, label: 'Publicado' },
  ];
  mode: ProjectFormMode = 'create';
  draft: Partial<IProject> = this.createEmptyDraft();
  projectId = '';
  notFound = false;
  translateErrors: Record<string, string> = {};

  constructor(
    public readonly facade: AdminDashboardFacade,
    private readonly projectsService: ProjectsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly storageService: StorageService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.mode =
      (this.route.snapshot.data['mode'] as ProjectFormMode) || 'create';
    await this.facade.loadProjectEditorDependencies();
    this.cdr.detectChanges();

    if (this.mode === 'create') {
      this.draft = this.facade.newProject;
      this.syncDraftSkills();
      this.cdr.detectChanges();
      return;
    }

    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    let project = this.facade.projects.find(
      (item) => item._id === this.projectId,
    );

    if (!project) {
      try {
        project = await this.projectsService.getProjectByIdOrSlug(
          this.projectId,
        );
      } catch (error) {
        console.error('Failed to load project for editing.', error);
      }
    }

    if (!project) {
      this.notFound = true;
      this.cdr.detectChanges();
      return;
    }

    this.draft = structuredClone(project);
    this.syncDraftSkills();
    this.cdr.detectChanges();
  }

  get pageTitle(): string {
    return this.mode === 'create' ? 'Crear proyecto' : 'Editar proyecto';
  }

  get pageCopy(): string {
    return this.mode === 'create'
      ? 'Usa un formulario dedicado para crear un nuevo proyecto del portafolio.'
      : 'Actualiza los datos del proyecto desde un formulario dedicado en lugar de editar dentro de la tabla.';
  }

  onSkillsChange(newIds: string[]): void {
    this.draft.skillIds = newIds;
    this.syncDraftSkills();
    this.cdr.detectChanges();
  }

  onPrimarySkillChange(primaryId: string | null): void {
    this.draft.primarySkillId = primaryId;
    this.syncDraftSkills();
    this.cdr.detectChanges();
  }

  getSkillLabel(skill: IApiTechSkill): string {
    return skill.label?.es || skill.label?.en || skill.value || '';
  }

  getSkillIconUrl(skill: IApiTechSkill): string | null {
    return resolveImageAssetUrl(skill.icon ?? null);
  }

  get coverAssets(): IProjectAsset[] {
    const coverImage = this.draft.coverImage;
    if (!coverImage) {
      return [];
    }

    return [typeof coverImage === 'string' ? { url: coverImage } : coverImage];
  }

  get galleryAssets(): IProjectAsset[] {
    return (this.draft.images || []).map((asset) =>
      typeof asset === 'string' ? { url: asset } : asset,
    );
  }

  get coverPreviewUrls(): string[] {
    // Only pass server-side URLs (assets with a .url property).
    // Base64/file assets are managed internally by add-photo via storage — feeding
    // them back as urlsPreviews would trigger an infinite ngOnChanges → syncImages loop.
    return this.coverAssets
      .filter(
        (asset): asset is { url: string } =>
          typeof asset !== 'string' && Boolean(asset.url),
      )
      .map((asset) => asset.url);
  }

  get galleryPreviewUrls(): string[] {
    return this.galleryAssets
      .filter(
        (asset): asset is { url: string } =>
          typeof asset !== 'string' && Boolean(asset.url),
      )
      .map((asset) => asset.url);
  }

  get coverStorageKey(): string {
    return `project-form-${this.mode}-${this.projectId || 'new'}-cover`;
  }

  get galleryStorageKey(): string {
    return `project-form-${this.mode}-${this.projectId || 'new'}-gallery`;
  }

  async submit(): Promise<void> {
    this.syncDraftSkills();
    this.draft.stack = (this.draft.skills ?? [])
      .map((skill) => this.getSkillLabel(skill))
      .filter((value): value is string => Boolean(value));

    if (this.mode === 'create') {
      await this.facade.createProject();
    } else {
      await this.facade.saveProject(this.draft as IProject);
    }

    if (!this.facade.contentError) {
      await this.clearImageDraftStorage();
      await this.router.navigate(['/admin/dashboard/projects']);
    }
  }

  async cancel(): Promise<void> {
    await this.clearImageDraftStorage();
    await this.router.navigate(['/admin/dashboard/projects']);
  }

  ngOnDestroy(): void {
    void this.clearImageDraftStorage();
  }

  onCoverAssetsChange(assets: IProjectAsset[]): void {
    this.draft.coverImage = assets[0] ?? null;
  }

  onGalleryAssetsChange(assets: IProjectAsset[]): void {
    this.draft.images = assets;
  }

  onUploadError(message: string): void {
    this.facade.onImageUploadError(message);
  }

  private async clearImageDraftStorage(): Promise<void> {
    await Promise.all([
      this.storageService.deleteStorage(this.coverStorageKey),
      this.storageService.deleteStorage(this.galleryStorageKey),
    ]);
  }

  private createEmptyDraft(): Partial<IProject> {
    return {
      title: { es: '', en: '' },
      summary: { es: '', en: '' },
      description: { es: '', en: '' },
      stack: [],
      skillIds: [],
      primarySkillId: null,
      skills: [],
      primarySkill: null,
      images: [],
      coverImage: null,
      projectLink: '',
      codeLink: '',
      featured: false,
      status: 'draft',
      publishedAt: '',
    };
  }

  private syncDraftSkills(): void {
    const availableSkillIds = new Set(
      this.facade.techSkills
        .filter(
          (skill): skill is IApiTechSkill & { _id: string } =>
            typeof skill._id === 'string' && Boolean(skill._id),
        )
        .map((skill) => skill._id),
    );

    const derivedIds =
      this.draft.skillIds?.filter(
        (id): id is string =>
          typeof id === 'string' && availableSkillIds.has(id),
      ) ?? [];

    this.draft.skillIds = [...new Set(derivedIds)];

    const skillMap = new Map(
      this.facade.techSkills
        .filter(
          (s): s is IApiTechSkill & { _id: string } =>
            typeof s._id === 'string',
        )
        .map((s) => [s._id, s]),
    );
    this.draft.skills = this.draft.skillIds
      .map((id) => skillMap.get(id))
      .filter(
        (s): s is IApiTechSkill & { _id: string } => !!s,
      ) as IApiTechSkill[];

    if (
      !this.draft.primarySkillId ||
      !this.draft.skillIds.includes(this.draft.primarySkillId)
    ) {
      this.draft.primarySkillId = this.draft.skillIds[0] ?? null;
    }

    this.draft.primarySkill =
      (this.draft.skills ?? []).find(
        (skill) => skill._id === this.draft.primarySkillId,
      ) ?? null;
  }
}
