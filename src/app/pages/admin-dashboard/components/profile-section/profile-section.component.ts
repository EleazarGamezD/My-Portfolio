import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IApiProfile, ILocalizedText } from '@core/interfaces/content/content.interface';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
    selector: 'app-admin-profile-section',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile-section.component.html',
    styleUrl: './profile-section.component.scss',
})
export class AdminProfileSectionComponent {
    @Input() profile: IApiProfile | null = null;
    @Input() contentLoading = false;
    @Input() saveLoading = false;
    @Output() saveProfile = new EventEmitter<void>();

    constructor(public readonly i18nService: I18nService) { }

    getLocalizedText(value?: ILocalizedText): string {
        if (!value) {
            return '-';
        }

        const currentLanguage = this.i18nService.currentLanguage();
        return value[currentLanguage] || value.es || value.en || '-';
    }
}
