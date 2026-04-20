import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IApiProfile, ILocalizedText } from '@core/interfaces/content/content.interface';
import { IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import {
    ButtonModule,
    CardModule,
    FormModule,
    SpinnerModule,
} from '@coreui/angular';
import { AdminImageUploaderComponent } from '../admin-image-uploader/admin-image-uploader.component';

@Component({
    selector: 'app-admin-profile-section',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CardModule, FormModule, SpinnerModule, AdminImageUploaderComponent],
    templateUrl: './profile-section.component.html',
    styleUrl: './profile-section.component.scss',
})
export class AdminProfileSectionComponent {
    @Input() profile: IApiProfile | null = null;
    @Input() contentLoading = false;
    @Input() saveLoading = false;
    @Output() saveProfile = new EventEmitter<void>();
    @Output() heroSlideImageAssetsChange = new EventEmitter<{ index: number; assets: IProjectAsset[] }>();
    @Output() imageUploadError = new EventEmitter<string>();

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
        return resolveImageAssetUrl(asset);
    }

    getHeroSlideAssets(index: number): IProjectAsset[] {
        const slide = this.profile?.metadata?.heroSlides?.[index];
        if (!slide?.image) {
            return [];
        }

        return [typeof slide.image === 'string' ? { url: slide.image } : slide.image];
    }
}
