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
  loading = true;
  contentLoading = true;
  error: string | null = null;
  contentError: string | null = null;
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
}
