import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RequestStateService {
  private readonly pendingRequestsSubject = new BehaviorSubject(0);

  readonly pendingRequests$ = this.pendingRequestsSubject.asObservable().pipe(distinctUntilChanged());

  get pendingRequests(): number {
    return this.pendingRequestsSubject.value;
  }

  beginRequest(): void {
    this.pendingRequestsSubject.next(this.pendingRequests + 1);
  }

  endRequest(): void {
    this.pendingRequestsSubject.next(Math.max(0, this.pendingRequests - 1));
  }

  async waitForIdle(): Promise<void> {
    if (this.pendingRequests === 0) {
      return;
    }

    await firstValueFrom(this.pendingRequests$.pipe(filter((pendingRequests) => pendingRequests === 0)));
  }
}
