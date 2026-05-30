import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { ITheme } from '@core/interfaces/theme/theme.interface';
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

  applyTheme(colors: ITheme['colors']): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.documentElement.style.setProperty('--base-color', colors.baseColor);
  }

  resetApplied(): void {
    this.applied = false;
  }
}
