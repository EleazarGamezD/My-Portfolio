import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IApiContentItem,
  ILocalizedText,
} from '@core/interfaces/content/content.interface';
import { AdminContentSectionVariant } from '@core/interfaces/admin-dashboard/admin-dashboard.interface';
import { I18nService } from '@core/services/i18n/i18n.service';
import {
  BadgeModule,
  ButtonModule,
  CardModule,
  FormModule,
  SpinnerModule,
  TableModule,
} from '@coreui/angular';
import {
  Language,
  TranslateButtonComponent,
} from '../shared/translate-button/translate-button.component';
import { ShowErrorsComponent } from '../shared/show-errors/show-errors.component';

@Component({
  selector: 'app-admin-content-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    FormModule,
    SpinnerModule,
    TableModule,
    TranslateButtonComponent,
    ShowErrorsComponent,
  ],
  templateUrl: './content-section.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content-section.component.scss',
})
export class AdminContentSectionComponent {
  readonly i18nService = inject(I18nService);

  readonly Language = Language;
  translateErrors: Record<string, string> = {};

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

  get shouldShowCreateBox(): boolean {
    return this.variant !== 'socialLinks';
  }

  get shouldShowDeleteAction(): boolean {
    return this.variant !== 'socialLinks';
  }

  getIconClass(item: IApiContentItem): string {
    return typeof item.icon === 'string' && item.icon.trim()
      ? item.icon.trim()
      : 'fa-solid fa-link';
  }

  setDraftCurrentPeriod(value: boolean): void {
    this.draft.period ??= {};
    this.draft.period.current = value;

    if (value) {
      this.draft.period.end = null;
    }
  }

  setItemCurrentPeriod(item: IApiContentItem, value: boolean): void {
    item.period ??= {};
    item.period.current = value;

    if (value) {
      item.period.end = null;
    }
  }

  setTranslateError(key: string, error: string): void {
    this.translateErrors[key] = error;
  }
}
