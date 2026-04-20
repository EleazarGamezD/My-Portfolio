import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IProject, IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { AlertModule, ButtonModule, CardModule, FormModule } from '@coreui/angular';
import { AdminImageUploaderComponent } from '@pages/admin-dashboard/components/admin-image-uploader/admin-image-uploader.component';

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
    AdminImageUploaderComponent,
  ],
  templateUrl: './project-form-page.component.html',
  styleUrl: './project-form-page.component.scss',
})
export class AdminProjectFormPageComponent implements OnInit {
  mode: ProjectFormMode = 'create';
  draft: Partial<IProject> = this.createEmptyDraft();
  stackValue = '';
  projectId = '';
  notFound = false;

  constructor(
    public readonly facade: AdminDashboardFacade,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.mode = (this.route.snapshot.data['mode'] as ProjectFormMode) || 'create';
    await this.facade.ensureContentReady();

    if (this.mode === 'create') {
      this.draft = this.facade.newProject;
      this.stackValue = this.facade.newProjectStackValue;
      return;
    }

    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    const project = this.facade.projects.find((item) => item._id === this.projectId);

    if (!project) {
      this.notFound = true;
      return;
    }

    this.draft = structuredClone(project);
    this.stackValue = project.stack?.join(', ') || '';
  }

  get pageTitle(): string {
    return this.mode === 'create' ? 'Create project' : 'Edit project';
  }

  get pageCopy(): string {
    return this.mode === 'create'
      ? 'Use a dedicated Booking-style form to create a new portfolio project.'
      : 'Update project data in a dedicated form instead of editing inside the table.';
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

  async submit(): Promise<void> {
    this.draft.stack = this.stackValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (this.mode === 'create') {
      this.facade.newProjectStackValue = this.stackValue;
      await this.facade.createProject();
    } else {
      await this.facade.saveProject(this.draft as IProject);
    }

    if (!this.facade.contentError) {
      await this.router.navigate(['/admin/dashboard/projects']);
    }
  }

  async cancel(): Promise<void> {
    await this.router.navigate(['/admin/dashboard/projects']);
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

  private createEmptyDraft(): Partial<IProject> {
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
}
