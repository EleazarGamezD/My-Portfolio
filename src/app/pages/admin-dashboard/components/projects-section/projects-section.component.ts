import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ILocalizedText, IProject } from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
    selector: 'app-admin-projects-section',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './projects-section.component.html',
    styleUrl: './projects-section.component.scss',
})
export class AdminProjectsSectionComponent {
    @Input() projects: IProject[] = [];
    @Input() newProject: Partial<IProject> = {};
    @Input() newProjectStackValue = '';
    @Input() newProjectCoverImageValue = '';
    @Input() newProjectImagesValue = '';
    @Input() contentLoading = false;
    @Input() actionLoadingKey: string | null = null;

    @Output() createProject = new EventEmitter<void>();
    @Output() saveProject = new EventEmitter<IProject>();
    @Output() deleteProject = new EventEmitter<IProject>();
    @Output() newProjectStackValueChange = new EventEmitter<string>();
    @Output() newProjectCoverImageValueChange = new EventEmitter<string>();
    @Output() newProjectImagesValueChange = new EventEmitter<string>();
    @Output() projectStackChange = new EventEmitter<{ project: IProject; value: string }>();
    @Output() projectCoverImageChange = new EventEmitter<{ project: IProject; value: string }>();
    @Output() projectImagesChange = new EventEmitter<{ project: IProject; value: string }>();

    constructor(public readonly i18nService: I18nService) { }

    isActionLoading(actionKey: string): boolean {
        return this.actionLoadingKey === actionKey;
    }

    getProjectCoverImageValue(project: IProject): string {
        const coverImage = project.coverImage;

        if (!coverImage) {
            return '';
        }

        if (typeof coverImage === 'string') {
            return coverImage;
        }

        return coverImage.url || coverImage.base64 || '';
    }

    getProjectImagesValue(project: IProject): string {
        return (project.images || [])
            .map((image) => {
                if (typeof image === 'string') {
                    return image;
                }

                return image.url || image.base64 || '';
            })
            .filter(Boolean)
            .join('\n');
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
}
