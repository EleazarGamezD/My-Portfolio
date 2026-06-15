import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import { I18nService } from '@core/services/i18n/i18n.service';
import { StorageService } from '@core/services/storage/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loader-circle',
  imports: [],
  templateUrl: './loader-circle.component.html',
  styleUrl: './loader-circle.component.scss',
})
export class LoaderCircleComponent implements OnInit, OnDestroy {
  readonly isVisible = signal(false);
  readonly isRendered = signal(false);

  private readonly exitDurationMs = 320;

  private watchSubscription?: Subscription;
  private hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly i18nService: I18nService,
    private readonly storageService: StorageService,
  ) {}

  async ngOnInit(): Promise<void> {
    const storedValue = await this.storageService.getStorage(NgStorage.LOADER);
    this.updateVisibility(Boolean(storedValue));

    this.watchSubscription = this.storageService.watchStorage(NgStorage.LOADER).subscribe((value) => {
      this.updateVisibility(Boolean(value));
    });
  }

  ngOnDestroy(): void {
    this.watchSubscription?.unsubscribe();
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
    }
  }

  get loaderMessage(): string {
    return this.i18nService.t('common.loading');
  }

  private updateVisibility(nextVisible: boolean): void {
    if (nextVisible) {
      if (this.hideTimeoutId) {
        clearTimeout(this.hideTimeoutId);
        this.hideTimeoutId = null;
      }

      this.isRendered.set(true);
      this.isVisible.set(true);
      return;
    }

    this.isVisible.set(false);

    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
    }

    this.hideTimeoutId = setTimeout(() => {
      this.isRendered.set(false);
      this.hideTimeoutId = null;
    }, this.exitDurationMs);
  }
}
