import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IAdminDashboardFilters } from '@core/interfaces/admin/admin.interface';
import { IApiContentItem, IApiProfile, IApiResume, ILocalizedText } from '@core/interfaces/content/content.interface';
import { IProject } from '@core/interfaces/projects/projects.interfaces';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { IDashboardMetrics } from '@core/services/analytics/analytics.service';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { ProjectsService } from '@core/services/projects/projects.service';

type AdminSection =
  | 'overview'
  | 'projects'
  | 'profile'
  | 'skills'
  | 'experience'
  | 'testimonials'
  | 'resumes'
  | 'socialLinks';

type ContentResourceName = 'techSkills' | 'experience' | 'testimonials' | 'resumes' | 'socialLinks';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  metrics: IDashboardMetrics | null = null;
  profile: IApiProfile | null = null;
  projects: IProject[] = [];
  techSkills: IApiContentItem[] = [];
  experience: IApiContentItem[] = [];
  testimonials: IApiContentItem[] = [];
  socialLinks: IApiContentItem[] = [];
  resumes: IApiResume[] = [];
  readonly newProject: Partial<IProject> = this.createEmptyProjectDraft();
  newProjectStackValue = '';
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
  activeSection: AdminSection = 'overview';
  readonly sections: Array<{ key: AdminSection; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'projects', label: 'Projects' },
    { key: 'profile', label: 'Profile' },
    { key: 'skills', label: 'Skills' },
    { key: 'experience', label: 'Experience' },
    { key: 'testimonials', label: 'Testimonials' },
    { key: 'resumes', label: 'Resumes' },
    { key: 'socialLinks', label: 'Social Links' },
  ];
  readonly filters: IAdminDashboardFilters = {
    year: '',
    month: '',
    day: '',
    from: '',
    to: '',
  };

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly contentService: ContentService,
    private readonly projectsService: ProjectsService,
    private readonly router: Router,
    public readonly i18nService: I18nService,
  ) { }

  async ngOnInit(): Promise<void> {
    const authenticated = await this.adminAuthService.isAuthenticated();

    if (!authenticated) {
      await this.router.navigate(['/admin/login'], {
        queryParams: { redirectTo: '/admin/dashboard' },
      });
      return;
    }

    await Promise.all([
      this.loadMetrics(),
      this.loadContentData(),
    ]);
  }

  async loadMetrics(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.metrics = await this.adminAuthService.getDashboardMetrics(this.filters);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load metrics';
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

  async logout(): Promise<void> {
    await this.adminAuthService.logout();
    this.metrics = null;
    await this.router.navigateByUrl('/admin/login');
  }

  async loadContentData(): Promise<void> {
    try {
      this.contentLoading = true;
      this.contentError = null;

      const [projects, profile, techSkills, experience, testimonials, socialLinks, resumes] = await Promise.all([
        this.projectsService.getProjects(),
        this.contentService.getProfile(),
        this.contentService.getTechSkills(),
        this.contentService.getExperience(),
        this.contentService.getTestimonials(),
        this.contentService.getSocialLinks(),
        this.contentService.getResumes(),
      ]);

      this.projects = projects;
      this.profile = profile;
      this.techSkills = techSkills;
      this.experience = experience;
      this.testimonials = testimonials;
      this.socialLinks = socialLinks;
      this.resumes = resumes;
    } catch (err) {
      this.contentError = err instanceof Error ? err.message : 'Failed to load admin content';
      console.error('Error loading admin content:', err);
    } finally {
      this.contentLoading = false;
    }
  }

  setActiveSection(section: AdminSection): void {
    this.activeSection = section;
  }

  async saveProject(project: IProject): Promise<void> {
    if (!project._id) {
      this.contentError = 'Project id is required to save changes.';
      return;
    }

    const payload: Partial<IProject> = {
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      description: project.description,
      stack: project.stack,
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

  async saveContentItem(resourceName: ContentResourceName, item: IApiContentItem | IApiResume): Promise<void> {
    if (!item._id) {
      this.contentError = 'Content item id is required to save changes.';
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

  isActionLoading(actionKey: string): boolean {
    return this.actionLoadingKey === actionKey;
  }

  getMetricTotal(type: string): number {
    return this.metrics?.groupedTotals?.find((item) => item._id === type)?.total ?? 0;
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

  private resetProjectDraft(): void {
    Object.assign(this.newProject, this.createEmptyProjectDraft());
    this.newProjectStackValue = '';
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
    } catch (error) {
      this.contentError = error instanceof Error ? error.message : 'Failed to apply admin action';
      console.error('Admin action failed:', error);
    } finally {
      this.actionLoadingKey = null;
    }
  }

  private confirmAction(message: string): boolean {
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
      return true;
    }

    return window.confirm(message);
  }
}
