import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

declare global {
  interface Window {
    templateBridge?: { reinitAll?: () => void };
  }
}

@Injectable({ providedIn: 'root' })
export class TemplateScriptsService {
  private readonly document = inject<Document>(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly scriptNames = [
    'jquery.js',
    'vendors.min.js',
    'main.js',
    'templateBridge.js',
  ];
  private loadPromise?: Promise<void>;

  loadWhenIdle(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve) => {
      const load = () => {
        void this.loadSequentially()
          .then(() => {
            this.document.defaultView?.dispatchEvent(
              new CustomEvent('template-reinit'),
            );
          })
          .finally(resolve);
      };

      const requestIdle = this.document.defaultView?.requestIdleCallback;
      if (typeof requestIdle === 'function') {
        requestIdle(load, { timeout: 900 });
        return;
      }

      this.document.defaultView?.setTimeout(load, 250);
    });

    return this.loadPromise;
  }

  private async loadSequentially(): Promise<void> {
    for (const scriptName of this.scriptNames) {
      await this.loadScript(scriptName);
    }
  }

  private loadScript(scriptName: string): Promise<void> {
    const src = new URL(
      `assets/js/${scriptName}`,
      this.document.baseURI,
    ).toString();
    const existing = this.document.querySelector<HTMLScriptElement>(
      `script[data-template-script="${scriptName}"]`,
    );

    if (existing?.dataset['loaded'] === 'true') {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const script = existing ?? this.document.createElement('script');

      script.dataset['templateScript'] = scriptName;
      script.defer = true;
      script.src = src;
      script.onload = () => {
        script.dataset['loaded'] = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${scriptName}`));

      if (!existing) {
        this.document.body.appendChild(script);
      }
    });
  }
}
