const pendingReinitTimers = new Map<number, { timerId: number; resolvers: Array<() => void> }>();

function dispatchTemplateReinit(delay: number): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  const existing = pendingReinitTimers.get(delay);
  if (existing) {
    return new Promise<void>((resolve) => {
      existing.resolvers.push(resolve);
    });
  }

  return new Promise<void>((resolve) => {
    const resolvers: Array<() => void> = [resolve];
    const timerId = window.setTimeout(() => {
      pendingReinitTimers.delete(delay);
      window.dispatchEvent(new CustomEvent('template-reinit'));
      resolvers.forEach((done) => done());
    }, delay);

    pendingReinitTimers.set(delay, { timerId, resolvers });
  });
}

export function requestTemplateReinit(delays: number[] = [120, 420]): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  const bridge = window as Window & { templateBridge?: { reinitAll?: () => void } };
  if (typeof bridge.templateBridge?.reinitAll !== 'function') {
    return Promise.resolve();
  }

  const uniqueDelays = Array.from(new Set(delays.filter((delay) => Number.isFinite(delay) && delay >= 0)));
  return Promise.all(uniqueDelays.map((delay) => dispatchTemplateReinit(delay))).then(() => undefined);
}
