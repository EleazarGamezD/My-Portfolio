import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable, NgZone, inject } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import { RequestStateService } from '@core/services/request-state/request-state.service';
import { StorageService } from '@services/storage/storage.service';
import {
  catchError,
  defaultIfEmpty,
  lastValueFrom,
  map,
  throwError,
} from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GlobalHttpService {
  _http = inject(HttpClient);
  private readonly ngZone = inject(NgZone);
  private readonly requestStateService = inject(RequestStateService);
  private readonly tokenStorage = inject(StorageService);

  /**
   * Returns a promise that resolves to an HttpHeaders object containing the Authorization header with a valid bearer token.
   * If the user is not logged in, an empty HttpHeaders object is returned.
   * @returns {Promise<HttpHeaders>} A promise that resolves to an HttpHeaders object containing the Authorization header with a valid bearer token.
   */
  public async getAuthHeaders(): Promise<HttpHeaders> {
    const token = (await this.tokenStorage.getStorage(
      NgStorage.TOKEN,
    )) as string;
    let headers = new HttpHeaders();

    if (environment.backendApiKey) {
      headers = headers.set('x-api-key', environment.backendApiKey);
    }

    if (token) {
      return headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Performs a HTTP request.
   * @param route URL of the request.
   * @param payload Optional data to be passed to the request. If the request is a GET, this is ignored.
   * @param method HTTP method. Defaults to RequestMethod.GET.
   * @returns A Promise that resolves with the response to the HTTP request.
   * @throws An error if the HTTP request fails.
   */
  public async makeRequest<T, P>(
    route: string,
    payload: P,
    method: string = RequestMethod.GET,
  ): Promise<T> {
    try {
      const response = await this.makeHttpRequest<T>(route, payload, method);
      return this.ngZone.run(() => response);
    } catch (error) {
      await this.handleAuthFailure(error);
      console.error('Error:', error);
      throw this.ngZone.run(() => error);
    }
  }

  /**
   * Performs a HTTP request.
   * @param url URL of the request.
   * @param options Optional data to be passed to the request. If the request is a GET, this is ignored.
   * @param method HTTP method. Defaults to RequestMethod.GET.
   * @returns A Promise that resolves with the response to the HTTP request.
   * @throws An error if the HTTP request fails.
   */
  public async makeHttpRequest<T>(
    url: string,
    options: unknown = {},
    method: string = RequestMethod.GET,
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const requestOptions: object =
      method === RequestMethod.GET ? { headers } : { body: options, headers };

    this.requestStateService.beginRequest();

    try {
      return await lastValueFrom(
        this._http.request<T>(method, url, requestOptions).pipe(
          map((response) => response as T),
          defaultIfEmpty(null as T),
          catchError((error: HttpErrorResponse) => throwError(() => error)),
        ),
      );
    } finally {
      this.requestStateService.endRequest();
    }
  }

  private async handleAuthFailure(error: unknown): Promise<void> {
    if (
      !(error instanceof HttpErrorResponse) ||
      error.status !== 401 ||
      typeof window === 'undefined'
    ) {
      return;
    }

    const currentPath = window.location.pathname;
    const isProtectedAdminRoute =
      currentPath.startsWith('/admin') &&
      !currentPath.startsWith('/admin/login') &&
      !currentPath.startsWith('/admin/forgot-password') &&
      !currentPath.startsWith('/admin/reset-password') &&
      !currentPath.startsWith('/admin/setup-account');

    if (!isProtectedAdminRoute) {
      return;
    }

    await this.tokenStorage.deleteStorage(NgStorage.TOKEN);
    await this.tokenStorage.deleteStorage(NgStorage.USER_EMAIL);
    await this.tokenStorage.deleteStorage(NgStorage.TOKEN_EXPIRES_AT);

    const redirectTo = encodeURIComponent(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    );

    this.ngZone.runOutsideAngular(() => {
      window.location.assign(
        `/admin/login?sessionExpired=1&redirectTo=${redirectTo}`,
      );
    });
  }
}
