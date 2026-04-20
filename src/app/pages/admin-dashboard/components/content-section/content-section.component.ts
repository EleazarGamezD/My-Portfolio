import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IApiContentItem, ILocalizedText } from '@core/interfaces/content/content.interface';
import { I18nService } from '@core/services/i18n/i18n.service';

export type AdminContentSectionVariant = 'skills' | 'experience' | 'testimonials' | 'socialLinks';

@Component({
    selector: 'app-admin-content-section',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './content-section.component.html',
    styleUrl: './content-section.component.scss',
})
export class AdminContentSectionComponent {
    @Input({ required: true }) sectionTitle = '';
    @Input({ required: true }) createTitle = '';
    @Input({ required: true }) emptyMessage = '';
    @Input({ required: true }) resourceKey = '';
    @Input({ required: true }) variant!: AdminContentSectionVariant;
    @Input() items: IApiContentItem[] = [];
    @Input() draft: Partial<IApiContentItem> = {};
    @Input() contentLoading = false;
    @Input() actionLoadingKey: string | null = null;

    @Output() createItem = new EventEmitter<void>();
    @Output() saveItem = new EventEmitter<IApiContentItem>();
    @Output() deleteItem = new EventEmitter<IApiContentItem>();

    constructor(public readonly i18nService: I18nService) { }

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

    isActionLoading(actionKey: string): boolean {
        return this.actionLoadingKey === actionKey;
    }
}
