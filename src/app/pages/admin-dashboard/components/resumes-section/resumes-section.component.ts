import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IApiResume, ILocalizedText } from '@core/interfaces/content/content.interface';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
    selector: 'app-admin-resumes-section',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './resumes-section.component.html',
    styleUrl: './resumes-section.component.scss',
})
export class AdminResumesSectionComponent {
    @Input() resumes: IApiResume[] = [];
    @Input() newResume: Partial<IApiResume> = {};
    @Input() contentLoading = false;
    @Input() actionLoadingKey: string | null = null;
    @Output() createResume = new EventEmitter<void>();
    @Output() saveResume = new EventEmitter<IApiResume>();
    @Output() deleteResume = new EventEmitter<IApiResume>();
    @Output() newResumeFileSelected = new EventEmitter<Event>();
    @Output() resumeFileSelected = new EventEmitter<{ item: IApiResume; event: Event }>();

    constructor(public readonly i18nService: I18nService) { }

    getLocalizedText(value?: ILocalizedText): string {
        if (!value) {
            return '-';
        }

        const currentLanguage = this.i18nService.currentLanguage();
        return value[currentLanguage] || value.es || value.en || '-';
    }

    getContentItemName(item: IApiResume): string {
        return this.getLocalizedText(item.label || item.title);
    }

    isActionLoading(actionKey: string): boolean {
        return this.actionLoadingKey === actionKey;
    }
}
