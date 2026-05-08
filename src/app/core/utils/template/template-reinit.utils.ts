export function requestTemplateReinit(delays: number[] = [120, 420, 900]): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  const initializer = (window as Window & { initializeComponents?: () => void }).initializeComponents;
  if (typeof initializer !== 'function') {
    return Promise.resolve();
  }

  return Promise.all(
    delays.map(
      (delay) =>
        new Promise<void>((resolve) => {
          window.setTimeout(() => {
            initializer();
            window.dispatchEvent(new Event('resize'));
            resolve();
          }, delay);
        }),
    ),
  ).then(() => undefined);
}
