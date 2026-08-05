import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { ITheme, IThemeColors } from '@core/interfaces/theme/theme.interface';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';
import { environment } from '../../../../environments/environment';

const BASE = environment.apiUrl;
const THEME_CACHE_KEY = `${environment.appName}-active-theme-colors`;

@Injectable({ providedIn: 'root' })
export class ThemeService extends GlobalHttpService {
  private applied = false;
  private loadedFromApi = false;
  private loadPromise?: Promise<void>;
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    super();
    this.applyCachedTheme();
  }

  /**
   * Applies the cached theme immediately and refreshes it once from the API.
   * Concurrent callers share the same refresh request.
   */
  async loadAndApplyActiveTheme(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.loadedFromApi) return;
    if (this.applied) {
      void this.refreshActiveTheme();
      return;
    }

    await this.refreshActiveTheme();
  }

  private refreshActiveTheme(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this.fetchAndApplyActiveTheme().finally(() => {
      this.loadPromise = undefined;
    });
    return this.loadPromise;
  }

  private async fetchAndApplyActiveTheme(): Promise<void> {
    try {
      const theme = await this.makeRequest<ITheme | null, null>(`${BASE}/themes/active`, null, RequestMethod.GET);
      if (theme?.colors) {
        this.applyTheme(theme.colors);
      }
      this.loadedFromApi = true;
    } catch {
      // fail silently – default CSS vars remain
    }
  }

  async listThemes(): Promise<ITheme[]> {
    return this.makeRequest<ITheme[], null>(`${BASE}/themes`, null, RequestMethod.GET);
  }

  async createTheme(payload: Partial<ITheme>): Promise<ITheme> {
    return this.makeRequest<ITheme, Partial<ITheme>>(`${BASE}/themes`, payload, RequestMethod.POST);
  }

  async updateTheme(id: string, payload: Partial<ITheme>): Promise<ITheme> {
    return this.makeRequest<ITheme, Partial<ITheme>>(`${BASE}/themes/${id}`, payload, RequestMethod.PATCH);
  }

  async deleteTheme(id: string): Promise<{ deleted: boolean }> {
    return this.makeRequest<{ deleted: boolean }, null>(`${BASE}/themes/${id}`, null, RequestMethod.DELETE);
  }

  async activateTheme(id: string): Promise<ITheme> {
    return this.makeRequest<ITheme, object>(`${BASE}/themes/${id}/activate`, {}, RequestMethod.POST);
  }

  async generatePalette(hex: string, mode: string, seed = Date.now().toString()): Promise<Partial<IThemeColors>> {
    return this.makeRequest<Partial<IThemeColors>, null>(
      `${BASE}/themes/generate-palette?hex=${encodeURIComponent(hex)}&mode=${encodeURIComponent(mode)}&seed=${encodeURIComponent(seed)}`,
      null,
      RequestMethod.GET,
    );
  }

  async runSeedThemes(force = false): Promise<{ seeded: boolean; count?: number; reason?: string }> {
    return this.makeRequest(`${BASE}/admin/seed-themes?force=${force}`, {}, RequestMethod.POST);
  }

  applyTheme(colors: IThemeColors): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = document.documentElement.style;
    root.setProperty('--base-color', colors.baseColor || '');
    if (colors.veryLightGray) root.setProperty('--very-light-gray', colors.veryLightGray);
    if (colors.darkGray) root.setProperty('--dark-gray', colors.darkGray);
    if (colors.mediumGray) root.setProperty('--medium-gray', colors.mediumGray);
    if (colors.lightMediumGray) root.setProperty('--light-medium-gray', colors.lightMediumGray);
    if (colors.altFont) {
      root.setProperty('--alt-font', colors.altFont);
      this.loadGoogleFont(colors.altFont);
    }
    if (colors.primaryFont) {
      root.setProperty('--primary-font', colors.primaryFont);
      this.loadGoogleFont(colors.primaryFont);
    }
    this.applied = true;
    try {
      localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(colors));
    } catch {
      // Storage may be unavailable in privacy mode; the applied theme still works.
    }
  }

  private applyCachedTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const cachedTheme = localStorage.getItem(THEME_CACHE_KEY);
      if (cachedTheme) {
        this.applyTheme(JSON.parse(cachedTheme) as IThemeColors);
      }
    } catch {
      // Ignore unavailable or malformed browser storage and keep CSS defaults.
    }
  }

  private loadGoogleFont(fontValue: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const name = fontValue.split(',')[0].trim().replace(/['"]/g, '');
    const id = `gf-${name.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@300;400;500;600;700;800&display=swap`;
    document.head.appendChild(link);
  }

  resetApplied(): void {
    this.applied = false;
    this.loadedFromApi = false;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(THEME_CACHE_KEY);
    }
  }
}
