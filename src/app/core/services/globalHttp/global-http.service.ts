import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import { StorageMap } from '@ngx-pwa/local-storage';
import { StorageService } from '@services/storage/storage.service';
import { catchError, defaultIfEmpty, lastValueFrom, map, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.example';


@Injectable({
  providedIn: 'root',
})
export class GlobalHttpService extends StorageService {
  constructor(
    public _http: HttpClient,
    storageMap: StorageMap,
    private readonly ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    super(storageMap, platformId);
  }

  /**
    * Returns a promise that resolves to an HttpHeaders object containing the Authorization header with a valid bearer token.
    * If the user is not logged in, an empty HttpHeaders object is returned.
    * @returns {Promise<HttpHeaders>} A promise that resolves to an HttpHeaders object containing the Authorization header with a valid bearer token.
    */
  public async getAuthHeaders(): Promise<HttpHeaders> {
    const token = (await this.getStorage(NgStorage.TOKEN)) as string;
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

    return lastValueFrom(
      this._http
        .request<T>(method, url, requestOptions)
        .pipe(
          map((response) => response as T),
          defaultIfEmpty(null as T),
          catchError((error: HttpErrorResponse) =>
            throwError(() => error),
          ),
        ),
    );
  }
}
