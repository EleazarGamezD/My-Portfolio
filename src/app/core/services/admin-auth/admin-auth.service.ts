import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import {
  IAdminLoginRequest,
  IAdminLoginResponse,
  IAdminMeResponse,
} from '@core/interfaces/admin/admin.interface';
import { API_ADMIN_ROUTES } from '@core/routes/admin/admin.routes';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService extends GlobalHttpService {
  constructor(
    httpClient: HttpClient,
    storageMap: StorageMap,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    super(httpClient, storageMap, platformId);
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

  async getCurrentAdmin() {
    return this.makeRequest<IAdminMeResponse, null>(API_ADMIN_ROUTES.me, null, RequestMethod.GET);
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
