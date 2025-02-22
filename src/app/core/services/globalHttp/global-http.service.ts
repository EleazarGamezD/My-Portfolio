import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { catchError, from, lastValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalHttpService {
  constructor(public httpService: HttpClient) {}

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
    return lastValueFrom(
      from(this.makeHttpRequest<T>(route, payload, method)).pipe(
        map((res: T) => res),
        catchError((error: HttpErrorResponse) => {
          console.error('Error:', error);
          throw error;
        }),
      ),
    );
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
    const headers = { 'Content-Type': 'application/json' };
    const requestOptions: object =
      method === RequestMethod.GET ? { headers } : { body: options, headers };
    return lastValueFrom(
      this.httpService
        .request<T>(method, url, requestOptions)
        .pipe(map((response) => response as T)),
    );
  }
}
