import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, race, timer } from 'rxjs';
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

  async waitForIdle(timeoutMs = 5000): Promise<void> {
    if (this.pendingRequests === 0) {
      return;
    }

    await firstValueFrom(
      race(
        this.pendingRequests$.pipe(filter((n) => n === 0)),
        timer(timeoutMs),
      ),
    );
  }
}
