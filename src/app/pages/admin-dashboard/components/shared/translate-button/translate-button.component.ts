import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TranslateService } from '@core/services/translate/translate.service';
import { ButtonModule, SpinnerComponent } from '@coreui/angular';

@Component({
  selector: 'app-translate-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, SpinnerComponent],
  templateUrl: './translate-button.component.html',
})
export class TranslateButtonComponent implements OnChanges {
  @Input() fromText = '';
  @Input() fromLang: 'es' | 'en' = 'es';
  @Input() toLang: 'es' | 'en' = 'en';
  @Output() translated = new EventEmitter<string>();

  loading = false;
  error = '';

  readonly langLabels: Record<string, string> = { es: 'ES', en: 'EN' };

  constructor(private readonly translateService: TranslateService) {}

  ngOnChanges(): void {
    this.error = '';
  }

  get buttonLabel(): string {
    return `Traducir al ${this.langLabels[this.toLang] ?? this.toLang.toUpperCase()}`;
  }

  async translate(): Promise<void> {
    if (!this.fromText?.trim() || this.loading) return;
    this.loading = true;
    this.error = '';
    try {
      const result = await this.translateService.translate({
        text: this.fromText.trim(),
        from: this.fromLang,
        to: this.toLang,
      });
      this.translated.emit(result.translated);
    } catch {
      this.error = 'No se pudo traducir.';
    } finally {
      this.loading = false;
    }
  }
}
