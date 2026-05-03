export function requestTemplateReinit(delays: number[] = [120, 420, 900]): void {
  if (typeof window === 'undefined') {
    return;
  }

  const initializer = (window as Window & { initializeComponents?: () => void }).initializeComponents;
  if (typeof initializer !== 'function') {
    return;
  }

  delays.forEach((delay) => {
    window.setTimeout(() => {
      initializer();
      window.dispatchEvent(new Event('resize'));
    }, delay);
  });
}
