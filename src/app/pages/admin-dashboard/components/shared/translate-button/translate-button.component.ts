import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslateService } from '@core/services/translate/translate.service';
import { ButtonModule, SpinnerComponent } from '@coreui/angular';
export enum Language {
  ES = 'es',
  EN = 'en',
}
export enum LanguageLabel {
  ES = 'Español',
  EN = 'Inglés',
}
@Component({
  selector: 'app-translate-button',
  standalone: true,
  imports: [ButtonModule, SpinnerComponent],
  templateUrl: './translate-button.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './translate-button.component.scss',
})
export class TranslateButtonComponent implements OnChanges {
  @Input() fromText = '';
  @Input() fromLang: Language = Language.ES;
  @Input() toLang: Language = Language.EN;
  @Output() translated = new EventEmitter<string>();
  /** Emits the error message on failure, or empty string on success/reset. */
  @Output() translationError = new EventEmitter<string>();

  loading = false;

  readonly langLabels: Record<Language, string> = {
    [Language.ES]: LanguageLabel.ES,
    [Language.EN]: LanguageLabel.EN,
  };

  constructor(private readonly translateService: TranslateService) {}

  ngOnChanges(): void {
    this.translationError.emit('');
  }

  get buttonLabel(): string {
    return `Traducir al ${this.langLabels[this.toLang] ?? this.toLang.toUpperCase()}`;
  }

  async translate(): Promise<void> {
    if (!this.fromText.trim() || this.loading) return;
    this.loading = true;
    this.translationError.emit('');
    try {
      const result = await this.translateService.translate({
        text: this.fromText.trim(),
        from: this.fromLang,
        to: this.toLang,
      });
      this.translated.emit(result.translated);
    } catch {
      this.translationError.emit('No se pudo traducir.');
    } finally {
      this.loading = false;
    }
  }
}
