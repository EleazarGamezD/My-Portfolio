import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RequestStateService {
  private readonly pendingRequestsSubject = new BehaviorSubject(0);

  readonly pendingRequests$ = this.pendingRequestsSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  get pendingRequests(): number {
    return this.pendingRequestsSubject.value;
  }

  beginRequest(): void {
    this.pendingRequestsSubject.next(this.pendingRequests + 1);
  }

  endRequest(): void {
    this.pendingRequestsSubject.next(Math.max(0, this.pendingRequests - 1));
  }
}
