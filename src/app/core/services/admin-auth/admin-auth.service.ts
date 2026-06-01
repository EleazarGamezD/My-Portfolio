import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import {
  IAdminDashboardFilters,
  IAdminLoginRequest,
  IAdminLoginResponse,
  IAdminMeResponse,
  IAdminUser,
  IAdminUsersResponse,
  IForgotPasswordRequest,
  IForgotPasswordResponse,
  IResetPasswordRequest,
  IResetPasswordResponse,
  ISetupAccountRequest,
  ISetupAccountResponse,
} from '@core/interfaces/admin/admin.interface';
import { API_ADMIN_ROUTES } from '@core/routes/admin/admin.routes';
import { IDashboardMetrics } from '@core/services/analytics/analytics.service';
import { RequestStateService } from '@core/services/request-state/request-state.service';
import { StorageMap } from '@ngx-pwa/local-storage';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService extends GlobalHttpService {
  constructor(
    httpClient: HttpClient,
    storageMap: StorageMap,
    ngZone: NgZone,
    requestStateService: RequestStateService,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    super(httpClient, storageMap, ngZone, requestStateService, platformId);
  }

  async login(email: string, password: string) {
    const response = await this.makeRequest<IAdminLoginResponse, IAdminLoginRequest>(
      API_ADMIN_ROUTES.login,
      { email, password },
      RequestMethod.POST,
    );

    await this.setStorage(NgStorage.TOKEN, response.accessToken);
    await this.setStorage(NgStorage.USER_EMAIL, response.user.email);

    return response;
  }

  async setupAccount(payload: ISetupAccountRequest) {
    const response = await this.makeRequest<ISetupAccountResponse, ISetupAccountRequest>(
      API_ADMIN_ROUTES.setupAccount,
      payload,
      RequestMethod.POST,
    );

    await this.setStorage(NgStorage.TOKEN, response.accessToken);
    await this.setStorage(NgStorage.USER_EMAIL, response.user.email);

    return response;
  }

  async forgotPassword(email: string) {
    return this.makeRequest<IForgotPasswordResponse, IForgotPasswordRequest>(
      API_ADMIN_ROUTES.forgotPassword,
      { email },
      RequestMethod.POST,
    );
  }

  async resetPassword(token: string, newPassword: string) {
    return this.makeRequest<IResetPasswordResponse, IResetPasswordRequest>(
      API_ADMIN_ROUTES.resetPassword,
      { token, newPassword },
      RequestMethod.POST,
    );
  }

  async getCurrentAdmin() {
    return this.makeRequest<IAdminMeResponse, null>(API_ADMIN_ROUTES.me, null, RequestMethod.GET);
  }

  async getDashboardMetrics(filters: IAdminDashboardFilters = {}) {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (typeof value === 'string' && value.trim()) {
        query.set(key, value.trim());
      }
    }

    const route = query.size > 0
      ? `${API_ADMIN_ROUTES.dashboardMetrics}?${query.toString()}`
      : API_ADMIN_ROUTES.dashboardMetrics;

    return this.makeRequest<IDashboardMetrics, null>(route, null, RequestMethod.GET);
  }

  async getAdminUsers() {
    const response = await this.makeRequest<IAdminUsersResponse, null>(API_ADMIN_ROUTES.users, null, RequestMethod.GET);
    return response.users;
  }

  async updateAdminUser(id: string, payload: Partial<IAdminUser>) {
    return this.makeRequest<{ updated: boolean; user: IAdminUser }, Partial<IAdminUser>>(
      API_ADMIN_ROUTES.updateUser(id),
      payload,
      RequestMethod.PATCH,
    );
  }

  async runSeedInitial(preset: 'starter' | 'demo-personal' = 'starter'): Promise<{ message: string; seeded?: boolean; count?: number }> {
    return this.makeRequest<{ message: string; seeded?: boolean; count?: number }, object>(
      `${API_ADMIN_ROUTES.seedInitial}?preset=${preset}`,
      {},
      RequestMethod.POST,
    );
  }

  async getSeedStatus() {
    return this.makeRequest<{
      hasAdminUsers: boolean;
      hasStarterContent: boolean;
      hasThemes: boolean;
      isFullyConfigured: boolean;
      shouldRunStarterSeed: boolean;
      shouldCreateBootstrapAdmin: boolean;
      shouldSeedThemes: boolean;
    }, null>(API_ADMIN_ROUTES.seedStatus, null, RequestMethod.GET);
  }

  async ensureInitialPlatformSetup() {
    const status = await this.getSeedStatus();

    if (!status.shouldRunStarterSeed && !status.shouldCreateBootstrapAdmin && !status.shouldSeedThemes) {
      return {
        ensured: false,
        status,
      };
    }

    const result = await this.runSeedInitial('starter');
    return {
      ensured: true,
      status,
      result,
    };
  }

  async isAuthenticated() {
    const token = await this.getStorage(NgStorage.TOKEN);

    if (!token) {
      return false;
    }

    try {
      const response = await this.getCurrentAdmin();
      return response.authenticated;
    } catch {
      return false;
    }
  }

  async logout() {
    await this.deleteStorage(NgStorage.TOKEN);
    await this.deleteStorage(NgStorage.USER_EMAIL);
    await this.deleteStorage(NgStorage.TOKEN_EXPIRES_AT);
  }
}
