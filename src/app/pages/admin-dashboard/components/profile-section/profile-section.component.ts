import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IApiProfile, ILocalizedText } from '@core/interfaces/content/content.interface';
import { IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';
import {
    ButtonModule,
    CardModule,
    FormModule,
    SpinnerModule,
} from '@coreui/angular';

@Component({
    selector: 'app-admin-profile-section',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CardModule, FormModule, SpinnerModule],
    templateUrl: './profile-section.component.html',
    styleUrl: './profile-section.component.scss',
})
export class AdminProfileSectionComponent {
    @Input() profile: IApiProfile | null = null;
    @Input() contentLoading = false;
    @Input() saveLoading = false;
    @Output() saveProfile = new EventEmitter<void>();
    @Output() heroSlideImageSelected = new EventEmitter<{ index: number; event: Event }>();

    constructor(public readonly i18nService: I18nService) { }

    getLocalizedText(value?: ILocalizedText): string {
        if (!value) {
            return '-';
        }

        const currentLanguage = this.i18nService.currentLanguage();
        return value[currentLanguage] || value.es || value.en || '-';
    }

    get heroSlides() {
        return this.profile?.metadata?.heroSlides ?? [];
    }

    addHeroSlide(): void {
        if (!this.profile) {
            return;
        }

        this.profile.metadata ??= {};
        this.profile.metadata.about ??= { es: '', en: '' };
        this.profile.metadata.heroSlides ??= [];
        this.profile.metadata.heroSlides.push({
            title: { es: '', en: '' },
            description: { es: '', en: '' },
            image: null,
        });
    }

    removeHeroSlide(index: number): void {
        this.profile?.metadata?.heroSlides?.splice(index, 1);
    }

    resolveImagePreview(asset?: string | IProjectAsset | null): string | null {
        if (!asset) {
            return null;
        }

        if (typeof asset === 'string') {
            return asset;
        }

        if (asset.url) {
            return asset.url;
        }

        if (asset.base64 && asset.mimeType) {
            return `data:${asset.mimeType};base64,${asset.base64}`;
        }

        if (asset.base64) {
            return asset.base64.startsWith('data:') ? asset.base64 : `data:image/webp;base64,${asset.base64}`;
        }

        return null;
    }

    getImageFieldValue(asset?: string | IProjectAsset | null): string {
        return typeof asset === 'string' ? asset : '';
    }

    updateImageField(index: number, value: string): void {
        const slide = this.profile?.metadata?.heroSlides?.[index];
        if (!slide) {
            return;
        }

        slide.image = value.trim() || null;
    }
}
