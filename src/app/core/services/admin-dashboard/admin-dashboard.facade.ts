import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { IAdminDashboardFilters, IAdminUser } from '@core/interfaces/admin/admin.interface';
import { IApiContentItem, IApiProfile, IApiResume, ILocalizedText } from '@core/interfaces/content/content.interface';
import { IProject } from '@core/interfaces/projects/projects.interfaces';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { IDashboardMetrics } from '@core/services/analytics/analytics.service';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { ProjectsService } from '@core/services/projects/projects.service';
import { ToastrService } from 'ngx-toastr';

export type ContentResourceName = 'techSkills' | 'experience' | 'testimonials' | 'resumes' | 'socialLinks';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardFacade {
  metrics: IDashboardMetrics | null = null;
  profile: IApiProfile | null = null;
  projects: IProject[] = [];
  techSkills: IApiContentItem[] = [];
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
    techSkills: this.createEmptyContentDraft(),
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
        this.projectsService.getProjects(),
        this.contentService.getProfile(),
        this.contentService.getTechSkills(),
        this.contentService.getExperience(),
        this.contentService.getTestimonials(),
        this.contentService.getSocialLinks(),
        this.contentService.getResumes(),
        this.adminAuthService.getAdminUsers(),
      ]);

      this.projects = projects;
      this.profile = profile;
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
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      description: project.description,
      stack: project.stack,
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
    if (!this.newProject.slug || title === '-') {
      this.contentError = 'Project slug and title are required.';
      this.showErrorToast(this.contentError, 'Projects');
      return;
    }

    const payload: Partial<IProject> = {
      slug: this.newProject.slug,
      title: this.newProject.title,
      summary: this.newProject.summary ?? { es: '', en: '' },
      description: this.newProject.description ?? { es: '', en: '' },
      stack: this.newProjectStackValue
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      coverImage: this.parseProjectCoverImage(this.newProjectCoverImageValue),
      images: this.parseProjectImages(this.newProjectImagesValue),
      projectLink: this.newProject.projectLink,
      codeLink: this.newProject.codeLink,
      featured: this.newProject.featured,
      status: this.newProject.status,
      publishedAt: this.newProject.publishedAt,
    };

    await this.runContentAction('project-create', async () => {
      await this.projectsService.createProject(payload);
      this.resetProjectDraft();
      await this.loadContentData();
      this.actionMessage = 'Project created.';
    });
  }

  async deleteProject(project: IProject): Promise<void> {
    if (!project._id || !this.confirmAction(`Delete project ${this.getProjectName(project)}?`)) {
      return;
    }

    await this.runContentAction(`project-delete-${project._id}`, async () => {
      await this.projectsService.deleteProject(project._id!);
      await this.loadContentData();
      this.actionMessage = `Project ${this.getProjectName(project)} deleted.`;
    });
  }

  async createContentItem(resourceName: Exclude<ContentResourceName, 'resumes'>): Promise<void> {
    const draft = this.newContentItems[resourceName];
    const name = this.getLocalizedText(draft.label || draft.title);

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

    const payload = this.getContentPayload(item);

    await this.runContentAction(`${resourceName}-save-${item._id}`, async () => {
      await this.contentService.updateContentItem(resourceName, item._id!, payload);
      await this.loadContentData();
      this.actionMessage = `${this.getContentItemName(item)} updated.`;
    });
  }

  async deleteContentItem(resourceName: ContentResourceName, item: IApiContentItem | IApiResume): Promise<void> {
    if (!item._id || !this.confirmAction(`Delete ${this.getContentItemName(item)}?`)) {
      return;
    }

    await this.runContentAction(`${resourceName}-delete-${item._id}`, async () => {
      await this.contentService.deleteContentItem(resourceName, item._id!);
      await this.loadContentData();
      this.actionMessage = `${this.getContentItemName(item)} deleted.`;
    });
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

  onProjectCoverImageChange(project: IProject, value: string): void {
    project.coverImage = this.parseProjectCoverImage(value);
  }

  onProjectImagesChange(project: IProject, value: string): void {
    project.images = this.parseProjectImages(value);
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
      slug: '',
      title: { es: '', en: '' },
      summary: { es: '', en: '' },
      description: { es: '', en: '' },
      stack: [],
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

  private confirmAction(message: string): boolean {
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
      return true;
    }

    return window.confirm(message);
  }

  private getSelectedFile(event: Event): File | null {
    const input = event.target as HTMLInputElement | null;
    return input?.files?.[0] ?? null;
  }

  private parseProjectCoverImage(value: string): string | null {
    const normalizedValue = value.trim();
    return normalizedValue || null;
  }

  private parseProjectImages(value: string): string[] {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
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
