export type AppLanguage = 'es' | 'en';

export const DEFAULT_LANGUAGE: AppLanguage = 'es';
export const SUPPORTED_LANGUAGES: readonly AppLanguage[] = ['es', 'en'];

export function isSupportedLanguage(value: string | null | undefined): value is AppLanguage {
  return !!value && SUPPORTED_LANGUAGES.includes(value as AppLanguage);
}
