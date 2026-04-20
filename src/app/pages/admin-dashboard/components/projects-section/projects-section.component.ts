import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ILocalizedText, IProject, IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import {
    BadgeModule,
    ButtonModule,
    CardModule,
    FormModule,
    GridModule,
    SpinnerModule,
    TableModule,
} from '@coreui/angular';
import { AdminImageUploaderComponent } from '../admin-image-uploader/admin-image-uploader.component';

@Component({
    selector: 'app-admin-projects-section',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BadgeModule,
        ButtonModule,
        CardModule,
        FormModule,
        GridModule,
        SpinnerModule,
        TableModule,
        AdminImageUploaderComponent,
    ],
    templateUrl: './projects-section.component.html',
    styleUrl: './projects-section.component.scss',
})
export class AdminProjectsSectionComponent {
    @Input() projects: IProject[] = [];
    @Input() newProject: Partial<IProject> = {};
    @Input() newProjectStackValue = '';
    @Input() contentLoading = false;
    @Input() actionLoadingKey: string | null = null;

    @Output() createProject = new EventEmitter<void>();
    @Output() saveProject = new EventEmitter<IProject>();
    @Output() deleteProject = new EventEmitter<IProject>();
    @Output() newProjectStackValueChange = new EventEmitter<string>();
    @Output() projectStackChange = new EventEmitter<{ project: IProject; value: string }>();
    @Output() newProjectCoverAssetsChange = new EventEmitter<IProjectAsset[]>();
    @Output() newProjectGalleryAssetsChange = new EventEmitter<IProjectAsset[]>();
    @Output() projectCoverAssetsChange = new EventEmitter<{ project: IProject; assets: IProjectAsset[] }>();
    @Output() projectGalleryAssetsChange = new EventEmitter<{ project: IProject; assets: IProjectAsset[] }>();
    @Output() imageUploadError = new EventEmitter<string>();

    constructor(public readonly i18nService: I18nService) { }

    isActionLoading(actionKey: string): boolean {
        return this.actionLoadingKey === actionKey;
    }

    getNewProjectCoverAssets(): IProjectAsset[] {
        const asset = this.toProjectAsset(this.newProject.coverImage);
        return asset ? [asset] : [];
    }

    getNewProjectGalleryAssets(): IProjectAsset[] {
        return this.toProjectAssetArray(this.newProject.images);
    }

    getProjectCoverAssets(project: IProject): IProjectAsset[] {
        const asset = this.toProjectAsset(project.coverImage);
        return asset ? [asset] : [];
    }

    getProjectGalleryAssets(project: IProject): IProjectAsset[] {
        return this.toProjectAssetArray(project.images);
    }

    getProjectStackValue(project: IProject): string {
        return project.stack?.join(', ') || '';
    }

    getLocalizedText(value?: ILocalizedText): string {
        if (!value) {
            return '-';
        }

        const currentLanguage = this.i18nService.currentLanguage();
        return value[currentLanguage] || value.es || value.en || '-';
    }

    getProjectStatusColor(status?: string): 'success' | 'warning' | 'secondary' | 'info' {
        switch ((status || '').toLowerCase()) {
            case 'published':
            case 'active':
                return 'success';
            case 'draft':
                return 'warning';
            case 'archived':
                return 'secondary';
            default:
                return 'info';
        }
    }

    resolveAssetPreview(asset?: string | IProjectAsset | null): string | null {
        return resolveImageAssetUrl(asset);
    }

    private toProjectAsset(asset?: string | IProjectAsset | null): IProjectAsset | null {
        if (!asset) {
            return null;
        }

        return typeof asset === 'string' ? { url: asset } : asset;
    }

    private toProjectAssetArray(assets?: Array<string | IProjectAsset> | null): IProjectAsset[] {
        return (assets || [])
            .map((asset) => this.toProjectAsset(asset))
            .filter((asset): asset is IProjectAsset => Boolean(asset));
    }
}
