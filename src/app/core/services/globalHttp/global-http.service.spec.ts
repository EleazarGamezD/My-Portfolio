import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

import { GlobalHttpService } from './global-http.service';
import { RequestStateService } from '../request-state/request-state.service';
import { StorageService } from '../storage/storage.service';

describe('GlobalHttpService', () => {
  let service: GlobalHttpService;
  let response$: Subject<{ ok: boolean }>;
  let httpClient: { request: ReturnType<typeof vi.fn> };
  let requestState: RequestStateService;

  beforeEach(() => {
    response$ = new Subject<{ ok: boolean }>();
    httpClient = { request: vi.fn(() => response$) };

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpClient },
        {
          provide: StorageService,
          useValue: { getStorage: vi.fn().mockResolvedValue(null) },
        },
      ],
    });
    service = TestBed.inject(GlobalHttpService);
    requestState = TestBed.inject(RequestStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('shares concurrent GET requests and allows normal browser caching', async () => {
    const firstRequest = service.makeHttpRequest<{ ok: boolean }>('/profile');
    const secondRequest = service.makeHttpRequest<{ ok: boolean }>('/profile');

    await vi.waitFor(() => expect(httpClient.request).toHaveBeenCalledTimes(1));
    expect(requestState.pendingRequests).toBe(1);

    const requestOptions = httpClient.request.mock.calls[0][2] as {
      headers: HttpHeaders;
    };
    expect(requestOptions.headers.has('Cache-Control')).toBe(false);
    expect(requestOptions.headers.has('Pragma')).toBe(false);

    response$.next({ ok: true });
    response$.complete();

    await expect(Promise.all([firstRequest, secondRequest])).resolves.toEqual([
      { ok: true },
      { ok: true },
    ]);
    expect(requestState.pendingRequests).toBe(0);
  });
});
