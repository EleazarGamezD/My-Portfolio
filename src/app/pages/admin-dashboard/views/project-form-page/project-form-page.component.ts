import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IApiTechSkill } from '@core/interfaces/content/content.interface';
import { IProject, IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { ProjectsService } from '@core/services/projects/projects.service';
import { StorageService } from '@core/services/storage/storage.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { AlertModule, ButtonModule, CardModule, FormModule } from '@coreui/angular';
import { AdminSkillsSectionComponent } from '@pages/admin-dashboard/components/skills-section/skills-section.component';
import { AddPhotoComponent } from '@pages/admin-dashboard/components/shared/add-photo/add-photo.component';
import { PhotoEditorComponent } from '@pages/admin-dashboard/components/shared/photo-editor/photo-editor.component';
import { TranslateButtonComponent, Language } from '@pages/admin-dashboard/components/shared/translate-button/translate-button.component';

type ProjectFormMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-project-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AlertModule,
    ButtonModule,
    CardModule,
    FormModule,
    AdminSkillsSectionComponent,
    AddPhotoComponent,
    PhotoEditorComponent,
    TranslateButtonComponent,
  ],
  templateUrl: './project-form-page.component.html',
  styleUrl: './project-form-page.component.scss',
})
export class AdminProjectFormPageComponent implements OnInit, OnDestroy {
  readonly Language = Language;
  mode: ProjectFormMode = 'create';
  draft: Partial<IProject> = this.createEmptyDraft();
  projectId = '';
  notFound = false;
  showSkillsLibrary = false;
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
    this.mode = (this.route.snapshot.data['mode'] as ProjectFormMode) || 'create';
    await this.facade.ensureContentReady();
    this.cdr.detectChanges();

    if (this.mode === 'create') {
      this.draft = this.facade.newProject;
      this.syncDraftSkills();
      this.cdr.detectChanges();
      return;
    }

    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    let project = this.facade.projects.find((item) => item._id === this.projectId);

    if (!project) {
      try {
        project = await this.projectsService.getProjectByIdOrSlug(this.projectId);
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

  get availableSkills(): IApiTechSkill[] {
    return this.facade.techSkills;
  }

  get selectedSkills(): IApiTechSkill[] {
    const selectedIds = this.draft.skillIds ?? [];
    if (selectedIds.length === 0) {
      return [];
    }

    const skillMap = new Map(
      this.availableSkills
        .filter((skill): skill is IApiTechSkill & { _id: string } => typeof skill._id === 'string' && Boolean(skill._id))
        .map((skill) => [skill._id, skill]),
    );

    const orderedSkills: IApiTechSkill[] = [];

    for (const id of selectedIds) {
      const skill = skillMap.get(id);
      if (skill) {
        orderedSkills.push(skill);
      }
    }

    return orderedSkills;
  }

  get coverAssets(): IProjectAsset[] {
    const coverImage = this.draft.coverImage;
    if (!coverImage) {
      return [];
    }

    return [typeof coverImage === 'string' ? { url: coverImage } : coverImage];
  }

  get galleryAssets(): IProjectAsset[] {
    return (this.draft.images || []).map((asset) => (typeof asset === 'string' ? { url: asset } : asset));
  }

  get coverPreviewUrls(): string[] {
    return this.coverAssets.map((asset) => resolveImageAssetUrl(asset)).filter((url): url is string => Boolean(url));
  }

  get galleryPreviewUrls(): string[] {
    return this.galleryAssets.map((asset) => resolveImageAssetUrl(asset)).filter((url): url is string => Boolean(url));
  }

  get coverStorageKey(): string {
    return `project-form-${this.mode}-${this.projectId || 'new'}-cover`;
  }

  get galleryStorageKey(): string {
    return `project-form-${this.mode}-${this.projectId || 'new'}-gallery`;
  }

  async submit(): Promise<void> {
    this.syncDraftSkills();
    this.draft.stack = this.selectedSkills
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

  toggleSkillSelection(skillId: string): void {
    const currentIds = new Set(this.draft.skillIds ?? []);

    if (currentIds.has(skillId)) {
      currentIds.delete(skillId);
    } else {
      currentIds.add(skillId);
    }

    this.draft.skillIds = Array.from(currentIds);
    this.syncDraftSkills();
  }

  setPrimarySkill(skillId: string): void {
    if (!this.isSkillSelected(skillId)) {
      return;
    }

    this.draft.primarySkillId = skillId;
    this.syncDraftSkills();
  }

  isSkillSelected(skillId: string): boolean {
    return (this.draft.skillIds ?? []).includes(skillId);
  }

  isPrimarySkill(skillId: string): boolean {
    return this.draft.primarySkillId === skillId;
  }

  getSkillLabel(skill: IApiTechSkill): string {
    return skill.label?.es || skill.label?.en || skill.value || '';
  }

  getSkillIconUrl(skill: IApiTechSkill): string | null {
    return resolveImageAssetUrl(skill.icon ?? null);
  }

  toggleSkillsLibrary(): void {
    this.showSkillsLibrary = !this.showSkillsLibrary;
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
      this.availableSkills
        .filter((skill): skill is IApiTechSkill & { _id: string } => typeof skill._id === 'string' && Boolean(skill._id))
        .map((skill) => skill._id),
    );

    const derivedIds =
      this.draft.skillIds?.filter((id): id is string => typeof id === 'string' && availableSkillIds.has(id)) ??
      [];

    this.draft.skillIds = [...new Set(derivedIds)];
    this.draft.skills = this.selectedSkills;

    if (!this.draft.primarySkillId || !this.draft.skillIds.includes(this.draft.primarySkillId)) {
      this.draft.primarySkillId = this.draft.skillIds[0] ?? null;
    }

    this.draft.primarySkill = this.selectedSkills.find((skill) => skill._id === this.draft.primarySkillId) ?? null;
  }
}
