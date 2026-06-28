import type { IApiContentItem } from '@core/interfaces/content/content.interface';

export type PortfolioSocialIcon = 'github' | 'linkedin' | 'twitter-x' | 'link';

export function resolvePortfolioSocialIcon(
  item: IApiContentItem,
): PortfolioSocialIcon {
  const source = [
    item.slug,
    item.href,
    item.label?.es,
    item.label?.en,
    typeof item.icon === 'string' ? item.icon : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (source.includes('github')) {
    return 'github';
  }

  if (source.includes('linkedin')) {
    return 'linkedin';
  }

  if (source.includes('x.com') || source.includes('twitter')) {
    return 'twitter-x';
  }

  return 'link';
}
