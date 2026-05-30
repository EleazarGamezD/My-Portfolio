import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { ITheme, IThemeColors } from '@core/interfaces/theme/theme.interface';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';
import { environment } from '../../../../environments/environment';

const BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ThemeService extends GlobalHttpService {
  private applied = false;
  private readonly platformId = inject(PLATFORM_ID);

  async loadAndApplyActiveTheme(): Promise<void> {
    if (this.applied || !isPlatformBrowser(this.platformId)) return;
    try {
      const theme = await this.makeRequest<ITheme | null, null>(`${BASE}/themes/active`, null, RequestMethod.GET);
      if (theme?.colors) {
        this.applyTheme(theme.colors);
        this.applied = true;
      }
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
  }
}
