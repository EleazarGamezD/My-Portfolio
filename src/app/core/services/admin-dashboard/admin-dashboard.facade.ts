import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { IAdminDashboardFilters, IAdminUser } from '@core/interfaces/admin/admin.interface';
import { IApiContentItem, IApiHeroSlide, IApiProfile, IApiResume, IApiTechSkill, ILocalizedText } from '@core/interfaces/content/content.interface';
import { IPaginationResponse, IProject, IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { IDashboardMetrics } from '@core/services/analytics/analytics.service';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { ProjectsService } from '@core/services/projects/projects.service';
import { ToastrService } from 'ngx-toastr';

export type ContentResourceName = 'techSkills' | 'experience' | 'testimonials' | 'resumes' | 'socialLinks';

interface AdminConfirmationDialog {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardFacade {
  metrics: IDashboardMetrics | null = null;
  profile: IApiProfile | null = null;
  projects: IProject[] = [];
  projectsPagination: IPaginationResponse<IProject> = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
  techSkills: IApiTechSkill[] = [];
  experience: IApiContentItem[] = [];
  testimonials: IApiContentItem[] = [];
  socialLinks: IApiContentItem[] = [];
  resumes: IApiResume[] = [];
  adminUsers: IAdminUser[] = [];
  currentAdmin: IAdminUser | null = null;

  readonly newProject: Partial<IProject> = this.createEmptyProjectDraft();
  newProjectStackValue = '';
  newProjectCoverImageValue = '';
  newProjectImagesValue = '';
  readonly newResume: Partial<IApiResume> = this.createEmptyResumeDraft();
  readonly newContentItems: Record<Exclude<ContentResourceName, 'resumes'>, Partial<IApiContentItem>> = {
    techSkills: this.createEmptySkillDraft(),
    experience: this.createEmptyContentDraft(),
    testimonials: this.createEmptyContentDraft(),
    socialLinks: this.createEmptyContentDraft(),
  };

  loading = true;
  contentLoading = true;
  actionLoadingKey: string | null = null;
  error: string | null = null;
  contentError: string | null = null;
  actionMessage: string | null = null;
  projectsPageSize = 10;
  readonly confirmationDialog: AdminConfirmationDialog = {
    visible: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
  };

  readonly filters: IAdminDashboardFilters = {
    year: '',
    month: '',
    day: '',
    from: '',
    to: '',
  };

  private currentAdminLoaded = false;
  private metricsLoaded = false;
  private contentLoaded = false;
  private pendingConfirmationAction: (() => Promise<void>) | null = null;

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly contentService: ContentService,
    private readonly projectsService: ProjectsService,
    private readonly i18nService: I18nService,
    private readonly toastr: ToastrService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  async ensureCurrentAdmin(): Promise<void> {
    if (this.currentAdminLoaded) {
      return;
    }

    const currentAdminResponse = await this.adminAuthService.getCurrentAdmin();
    this.currentAdmin = currentAdminResponse.user;
    this.currentAdminLoaded = true;
  }

  async ensureOverviewReady(): Promise<void> {
    await this.ensureCurrentAdmin();

    if (this.metricsLoaded) {
      return;
    }

    await this.loadMetrics();
    this.metricsLoaded = true;
  }

  async ensureContentReady(): Promise<void> {
    await this.ensureCurrentAdmin();

    if (this.contentLoaded) {
      return;
    }

    await this.loadContentData();
    this.contentLoaded = true;
  }

  async loadMetrics(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.metrics = await this.adminAuthService.getDashboardMetrics(this.filters);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load metrics';
      this.showErrorToast(this.error, 'Analytics');
      console.error('Error loading metrics:', err);
    } finally {
      this.loading = false;
    }
  }

  async applyFilters(): Promise<void> {
    await this.loadMetrics();
  }

  async clearFilters(): Promise<void> {
    this.filters.year = '';
    this.filters.month = '';
    this.filters.day = '';
    this.filters.from = '';
    this.filters.to = '';
    await this.loadMetrics();
  }

  async loadContentData(): Promise<void> {
    try {
      this.contentLoading = true;
      this.contentError = null;

      const [projects, profile, techSkills, experience, testimonials, socialLinks, resumes, adminUsers] = await Promise.all([
        this.projectsService.getProjectsPaginated({
          page: this.projectsPagination.currentPage,
          limit: this.projectsPageSize,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
        this.contentService.getProfile(),
        this.contentService.getTechSkills(),
        this.contentService.getExperience(),
        this.contentService.getTestimonials(),
        this.contentService.getSocialLinks(),
        this.contentService.getResumes(),
        this.adminAuthService.getAdminUsers(),
      ]);

      this.projectsPagination = projects;
      this.projects = projects.data;
      this.profile = this.normalizeProfile(profile);
      this.techSkills = techSkills;
      this.experience = experience;
      this.testimonials = testimonials;
      this.socialLinks = socialLinks;
      this.resumes = resumes;
      this.adminUsers = adminUsers;
    } catch (err) {
      this.contentError = err instanceof Error ? err.message : 'Failed to load admin content';
      this.showErrorToast(this.contentError, 'Admin content');
      console.error('Error loading admin content:', err);
    } finally {
      this.contentLoading = false;
    }
  }

  async saveProject(project: IProject): Promise<void> {
    if (!project._id) {
      this.contentError = 'Project id is required to save changes.';
      this.showErrorToast(this.contentError, 'Projects');
      return;
    }

    const payload: Partial<IProject> = {
      title: project.title,
      summary: project.summary,
      description: project.description,
      stack: project.stack,
      skillIds: project.skillIds,
      primarySkillId: project.primarySkillId,
      images: project.images,
      coverImage: project.coverImage,
      projectLink: project.projectLink,
      codeLink: project.codeLink,
      featured: project.featured,
      status: project.status,
      publishedAt: project.publishedAt,
    };

    await this.runContentAction(`project-save-${project._id}`, async () => {
      await this.projectsService.updateProject(project._id!, payload);
      await this.loadContentData();
      this.actionMessage = `Project ${this.getProjectName(project)} updated.`;
    });
  }

  async saveProfile(): Promise<void> {
    if (!this.profile) {
      this.contentError = 'Profile is not loaded.';
      this.showErrorToast(this.contentError, 'Profile');
      return;
    }

    this.ensureProfileMetadata();

    const payload: Partial<IApiProfile> = {
      label: this.profile.label,
      title: this.profile.title,
      description: this.profile.description,
      availability: this.profile.availability,
      location: this.profile.location,
      email: this.profile.email,
      phone: this.profile.phone,
      metadata: this.profile.metadata,
    };

    await this.runContentAction('profile-save', async () => {
      await this.contentService.updateProfile(payload);
      await this.loadContentData();
      this.actionMessage = 'Profile updated.';
    });
  }

  async createProject(): Promise<void> {
    const title = this.getLocalizedText(this.newProject.title);
    if (title === '-') {
      this.contentError = 'Project title is required.';
      this.showErrorToast(this.contentError, 'Projects');
      return;
    }

    const payload: Partial<IProject> = {
      title: this.newProject.title,
      summary: this.newProject.summary ?? { es: '', en: '' },
      description: this.newProject.description ?? { es: '', en: '' },
      stack: this.newProject.stack ?? [],
      skillIds: this.newProject.skillIds ?? [],
      primarySkillId: this.newProject.primarySkillId ?? null,
      coverImage: this.newProject.coverImage ?? null,
      images: this.newProject.images ?? [],
      projectLink: this.newProject.projectLink,
      codeLink: this.newProject.codeLink,
      featured: this.newProject.featured,
      status: this.newProject.status,
      publishedAt: this.newProject.publishedAt,
    };

    await this.runContentAction('project-create', async () => {
      await this.projectsService.createProject(payload);
      this.projectsPagination.currentPage = 1;
      this.resetProjectDraft();
      await this.loadContentData();
      this.actionMessage = 'Project created.';
    });
  }

  async deleteProject(project: IProject): Promise<void> {
    if (!project._id) {
      return;
    }

    this.openConfirmation(
      'Delete project',
      `This will permanently remove ${this.getProjectName(project)} from the portfolio.`,
      'Delete project',
      async () => {
        await this.runContentAction(`project-delete-${project._id}`, async () => {
          await this.projectsService.deleteProject(project._id!);
          await this.loadContentData();

          if (
            this.projects.length === 0 &&
            this.projectsPagination.currentPage > 1 &&
            this.projectsPagination.totalPages > 0
          ) {
            this.projectsPagination.currentPage = this.projectsPagination.totalPages;
            await this.loadContentData();
          }

          this.actionMessage = `Project ${this.getProjectName(project)} deleted.`;
        });
      },
    );
  }

  async deactivateProject(project: IProject): Promise<void> {
    if (!project._id) {
      return;
    }

    this.openConfirmation(
      'Deactivate project',
      `This will move ${this.getProjectName(project)} out of the published flow.`,
      'Deactivate project',
      async () => {
        await this.runContentAction(`project-save-${project._id}`, async () => {
          await this.projectsService.updateProject(project._id!, {
            ...project,
            status: 'archived',
          });
          await this.loadContentData();
          this.actionMessage = `Project ${this.getProjectName(project)} deactivated.`;
        });
      },
    );
  }

  async confirmPendingAction(): Promise<void> {
    if (!this.pendingConfirmationAction) {
      return;
    }

    const action = this.pendingConfirmationAction;
    this.pendingConfirmationAction = null;
    this.confirmationDialog.visible = false;
    await action();
  }

  cancelPendingAction(): void {
    this.pendingConfirmationAction = null;
    this.confirmationDialog.visible = false;
  }

  onConfirmationVisibleChange(visible: boolean): void {
    this.confirmationDialog.visible = visible;

    if (!visible) {
      this.pendingConfirmationAction = null;
    }
  }

  async createContentItem(resourceName: Exclude<ContentResourceName, 'resumes'>): Promise<void> {
    const draft = this.newContentItems[resourceName];
    const name = this.getLocalizedText(draft.label || draft.title);

    if (resourceName === 'techSkills') {
      const normalizedLabel = this.normalizeSkillLabel(draft.label?.es || draft.label?.en || draft.value || '');

      if (!normalizedLabel) {
        this.contentError = 'Skill label is required.';
        this.showErrorToast(this.contentError, 'Skills');
        return;
      }

      const payload: Partial<IApiTechSkill> = {
        label: { es: normalizedLabel, en: normalizedLabel },
        title: { es: normalizedLabel, en: normalizedLabel },
        value: normalizedLabel,
        icon: draft.icon ?? null,
        order: draft.order,
        active: draft.active ?? true,
      };

      await this.runContentAction(`${resourceName}-create`, async () => {
        await this.contentService.createContentItem(resourceName, payload);
        this.resetContentDraft(resourceName);
        await this.loadContentData();
        this.actionMessage = `${resourceName} item created.`;
      });
      return;
    }

    if (!draft.slug || name === '-') {
      this.contentError = `Slug and label are required to create ${resourceName}.`;
      this.showErrorToast(this.contentError, 'Content');
      return;
    }

    const payload: Partial<IApiContentItem> = {
      slug: draft.slug,
      label: draft.label,
      title: draft.title?.es || draft.title?.en ? draft.title : draft.label,
      description: draft.description?.es || draft.description?.en ? draft.description : { es: '', en: '' },
      value: draft.value,
      icon: draft.icon,
      href: draft.href,
      order: draft.order,
      active: draft.active ?? true,
      metadata: draft.metadata,
    };

    await this.runContentAction(`${resourceName}-create`, async () => {
      await this.contentService.createContentItem(resourceName, payload);
      this.resetContentDraft(resourceName);
      await this.loadContentData();
      this.actionMessage = `${resourceName} item created.`;
    });
  }

  async createResume(): Promise<void> {
    const name = this.getLocalizedText(this.newResume.label || this.newResume.title);

    if (!this.newResume.slug || name === '-' || !this.newResume.base64 || !this.newResume.fileName || !this.newResume.mimeType) {
      this.contentError = 'Resume slug, label and file are required.';
      this.showErrorToast(this.contentError, 'Resumes');
      return;
    }

    const payload: Partial<IApiResume> = {
      slug: this.newResume.slug,
      label: this.newResume.label,
      title: this.newResume.title?.es || this.newResume.title?.en ? this.newResume.title : this.newResume.label,
      description: this.newResume.description?.es || this.newResume.description?.en ? this.newResume.description : { es: '', en: '' },
      active: this.newResume.active ?? true,
      fileName: this.newResume.fileName,
      mimeType: this.newResume.mimeType,
      base64: this.newResume.base64,
      metadata: this.newResume.metadata,
    };

    await this.runContentAction('resumes-create', async () => {
      await this.contentService.createContentItem('resumes', payload);
      this.resetResumeDraft();
      await this.loadContentData();
      this.actionMessage = 'Resume created.';
    });
  }

  async saveContentItem(resourceName: ContentResourceName, item: IApiContentItem | IApiResume): Promise<void> {
    if (!item._id) {
      this.contentError = 'Content item id is required to save changes.';
      this.showErrorToast(this.contentError, 'Content');
      return;
    }

    const payload = resourceName === 'techSkills'
      ? this.getTechSkillPayload(item as IApiTechSkill)
      : this.getContentPayload(item);

    await this.runContentAction(`${resourceName}-save-${item._id}`, async () => {
      await this.contentService.updateContentItem(resourceName, item._id!, payload);
      await this.loadContentData();
      this.actionMessage = `${this.getContentItemName(item)} updated.`;
    });
  }

  async deleteContentItem(resourceName: ContentResourceName, item: IApiContentItem | IApiResume): Promise<void> {
    if (!item._id) {
      return;
    }

    this.openConfirmation(
      `Delete ${resourceName}`,
      `This will permanently remove ${this.getContentItemName(item)} from ${resourceName}.`,
      'Delete item',
      async () => {
        await this.runContentAction(`${resourceName}-delete-${item._id}`, async () => {
          await this.contentService.deleteContentItem(resourceName, item._id!);
          await this.loadContentData();
          this.actionMessage = `${this.getContentItemName(item)} deleted.`;
        });
      },
    );
  }

  async saveAdminUser(user: IAdminUser): Promise<void> {
    if (!user._id) {
      this.contentError = 'Admin user id is required to save changes.';
      this.showErrorToast(this.contentError, 'Users');
      return;
    }

    const payload: Partial<IAdminUser> = {
      displayName: user.displayName,
      role: user.role,
      active: user.active,
    };

    await this.runContentAction(`admin-user-save-${user._id}`, async () => {
      await this.adminAuthService.updateAdminUser(user._id!, payload);
      await this.loadContentData();
      this.actionMessage = `Admin user ${user.displayName} updated.`;
    });
  }

  isActionLoading(actionKey: string): boolean {
    return this.actionLoadingKey === actionKey;
  }

  async changeProjectsPage(page: number): Promise<void> {
    if (page < 1 || page === this.projectsPagination.currentPage) {
      return;
    }

    this.projectsPagination.currentPage = page;
    await this.loadContentData();
  }

  async onNewResumeFileSelected(event: Event): Promise<void> {
    const file = this.getSelectedFile(event);
    if (!file) {
      return;
    }

    try {
      const fileData = await this.readFileAsDataUrl(file);
      this.newResume.fileName = file.name;
      this.newResume.mimeType = file.type || 'application/octet-stream';
      this.newResume.base64 = fileData;
      this.contentError = null;
    } catch (error) {
      this.contentError = error instanceof Error ? error.message : 'Failed to read resume file';
      this.showErrorToast(this.contentError, 'Resumes');
    }
  }

  async onResumeFileSelected(item: IApiResume, event: Event): Promise<void> {
    const file = this.getSelectedFile(event);
    if (!file) {
      return;
    }

    try {
      const fileData = await this.readFileAsDataUrl(file);
      item.fileName = file.name;
      item.mimeType = file.type || 'application/octet-stream';
      item.base64 = fileData;
      this.contentError = null;
    } catch (error) {
      this.contentError = error instanceof Error ? error.message : 'Failed to read resume file';
      this.showErrorToast(this.contentError, 'Resumes');
    }
  }

  getLocalizedText(value?: ILocalizedText): string {
    if (!value) {
      return '-';
    }

    const currentLanguage = this.i18nService.currentLanguage();
    return value[currentLanguage] || value.es || value.en || '-';
  }

  getContentItemName(item: IApiContentItem): string {
    return this.getLocalizedText(item.label || item.title);
  }

  getProjectName(project: IProject): string {
    return this.getLocalizedText(project.title);
  }

  isCurrentAdmin(user: IAdminUser): boolean {
    return Boolean(this.currentAdmin?._id && user._id === this.currentAdmin._id);
  }

  onProjectStackChange(project: IProject, value: string): void {
    project.stack = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  onNewProjectCoverAssetsChange(assets: IProjectAsset[]): void {
    this.newProject.coverImage = assets[0] ?? null;
    this.contentError = null;
  }

  onNewProjectGalleryAssetsChange(assets: IProjectAsset[]): void {
    this.newProject.images = assets;
    this.contentError = null;
  }

  onTechSkillDraftIconAssetsChange(assets: IProjectAsset[]): void {
    const draft = this.newContentItems.techSkills as Partial<IApiTechSkill>;
    draft.icon = assets[0] ?? null;
    this.contentError = null;
  }

  onTechSkillIconAssetsChange(skill: IApiTechSkill, assets: IProjectAsset[]): void {
    skill.icon = assets[0] ?? null;
    this.contentError = null;
  }

  onProjectCoverAssetsChange(project: IProject, assets: IProjectAsset[]): void {
    project.coverImage = assets[0] ?? null;
    this.contentError = null;
  }

  onProjectGalleryAssetsChange(project: IProject, assets: IProjectAsset[]): void {
    project.images = assets;
    this.contentError = null;
  }

  onHeroSlideImageAssetsChange(index: number, assets: IProjectAsset[]): void {
    if (!this.profile) {
      return;
    }

    this.ensureProfileMetadata();
    const slide = this.profile.metadata?.heroSlides?.[index];
    if (!slide) {
      return;
    }

    slide.image = assets[0] ?? null;
    this.contentError = null;
  }

  onImageUploadError(message: string): void {
    this.contentError = message;
    this.showErrorToast(message, 'Images');
  }

  getContentItems(resourceName: Exclude<ContentResourceName, 'resumes'>): IApiContentItem[] {
    switch (resourceName) {
      case 'techSkills':
        return this.techSkills;
      case 'experience':
        return this.experience;
      case 'testimonials':
        return this.testimonials;
      case 'socialLinks':
        return this.socialLinks;
    }
  }

  getContentDraft(resourceName: Exclude<ContentResourceName, 'resumes'>): Partial<IApiContentItem> {
    return this.newContentItems[resourceName];
  }

  private resetProjectDraft(): void {
    Object.assign(this.newProject, this.createEmptyProjectDraft());
    this.newProjectStackValue = '';
    this.newProjectCoverImageValue = '';
    this.newProjectImagesValue = '';
  }

  private resetResumeDraft(): void {
    Object.assign(this.newResume, this.createEmptyResumeDraft());
  }

  private resetContentDraft(resourceName: Exclude<ContentResourceName, 'resumes'>): void {
    Object.assign(this.newContentItems[resourceName], this.createEmptyContentDraft());
  }

  private createEmptyProjectDraft(): Partial<IProject> {
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

  private createEmptyContentDraft(): Partial<IApiContentItem> {
    return {
      slug: '',
      label: { es: '', en: '' },
      title: { es: '', en: '' },
      description: { es: '', en: '' },
      value: '',
      icon: '',
      href: '',
      order: 0,
      active: true,
      metadata: {},
    };
  }

  private createEmptySkillDraft(): Partial<IApiTechSkill> {
    return {
      label: { es: '', en: '' },
      title: { es: '', en: '' },
      value: '',
      icon: null,
      order: 0,
      active: true,
      metadata: {},
    };
  }

  private createEmptyResumeDraft(): Partial<IApiResume> {
    return {
      slug: '',
      label: { es: '', en: '' },
      title: { es: '', en: '' },
      description: { es: '', en: '' },
      active: true,
      fileName: '',
      mimeType: '',
      base64: '',
      metadata: {},
    };
  }

  private normalizeProfile(profile: IApiProfile | null): IApiProfile | null {
    if (!profile) {
      return null;
    }

    const metadata = profile.metadata ?? {};

    return {
      ...profile,
      label: { es: profile.label?.es ?? '', en: profile.label?.en ?? '' },
      title: { es: profile.title?.es ?? '', en: profile.title?.en ?? '' },
      description: { es: profile.description?.es ?? '', en: profile.description?.en ?? '' },
      metadata: {
        ...metadata,
        about: {
          es: metadata.about?.es ?? '',
          en: metadata.about?.en ?? '',
        },
        heroSlides: Array.isArray(metadata.heroSlides)
          ? metadata.heroSlides.map((slide) => this.normalizeHeroSlide(slide))
          : [],
      },
    };
  }

  private normalizeHeroSlide(slide?: IApiHeroSlide): IApiHeroSlide {
    return {
      title: { es: slide?.title?.es ?? '', en: slide?.title?.en ?? '' },
      description: { es: slide?.description?.es ?? '', en: slide?.description?.en ?? '' },
      image: slide?.image ?? null,
    };
  }

  private ensureProfileMetadata(): void {
    if (!this.profile) {
      return;
    }

    this.profile.metadata ??= {};
    this.profile.metadata.about ??= { es: '', en: '' };
    this.profile.metadata.heroSlides ??= [];
  }

  private getContentPayload(item: IApiContentItem | IApiResume): Partial<IApiContentItem & IApiResume> {
    return {
      slug: item.slug,
      label: item.label,
      title: item.title,
      description: item.description,
      value: item.value,
      icon: item.icon,
      href: item.href,
      order: item.order,
      active: item.active,
      metadata: item.metadata,
      fileName: 'fileName' in item ? item.fileName : undefined,
      mimeType: 'mimeType' in item ? item.mimeType : undefined,
      base64: 'base64' in item ? item.base64 : undefined,
    };
  }

  private getTechSkillPayload(item: IApiTechSkill): Partial<IApiTechSkill> {
    const normalizedLabel = this.normalizeSkillLabel(item.label?.es || item.label?.en || item.value || '');

    return {
      label: { es: normalizedLabel, en: normalizedLabel },
      title: { es: normalizedLabel, en: normalizedLabel },
      value: normalizedLabel,
      icon: item.icon ?? null,
      order: item.order,
      active: item.active,
      metadata: item.metadata,
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

  private async runContentAction(actionKey: string, callback: () => Promise<void>): Promise<void> {
    try {
      this.actionLoadingKey = actionKey;
      this.actionMessage = null;
      this.contentError = null;
      await callback();
      if (this.actionMessage) {
        this.showSuccessToast(this.actionMessage, 'Admin updated');
      }
    } catch (error) {
      this.contentError = error instanceof Error ? error.message : 'Failed to apply admin action';
      this.showErrorToast(this.contentError, 'Admin action');
      console.error('Admin action failed:', error);
    } finally {
      this.actionLoadingKey = null;
    }
  }

  private showSuccessToast(message: string, title: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.toastr.success(message, title, {
      timeOut: 3000,
    });
  }

  private showErrorToast(message: string, title: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.toastr.error(message, title, {
      timeOut: 3000,
    });
  }

  private openConfirmation(
    title: string,
    message: string,
    confirmLabel: string,
    action: () => Promise<void>,
  ): void {
    this.confirmationDialog.title = title;
    this.confirmationDialog.message = message;
    this.confirmationDialog.confirmLabel = confirmLabel;
    this.confirmationDialog.visible = true;
    this.pendingConfirmationAction = action;
  }

  private getSelectedFile(event: Event): File | null {
    const input = event.target as HTMLInputElement | null;
    return input?.files?.[0] ?? null;
  }

  private async readFileAsDataUrl(file: File): Promise<string> {
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error('Resume file exceeds 5MB limit.');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }
}
