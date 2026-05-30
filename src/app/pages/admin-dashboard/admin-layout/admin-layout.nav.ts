import { INavData } from '@coreui/angular';
import { ADMIN_SECTIONS } from '@pages/admin-dashboard/admin-sections';

const mainSections = ADMIN_SECTIONS.filter((s) => s.key !== 'dangerZone');
const dangerSection = ADMIN_SECTIONS.find((s) => s.key === 'dangerZone')!;

export const adminNavItems: INavData[] = [
  {
    name: 'Admin Overview',
    title: true,
  },
  ...mainSections.map((section) => ({
    name: section.label,
    url: `/admin/dashboard/${section.key}`,
    iconComponent: { name: section.icon },
  })),
  {
    title: true,
    name: 'Sistema',
  },
  {
    name: dangerSection.label,
    url: `/admin/dashboard/${dangerSection.key}`,
    iconComponent: { name: dangerSection.icon },
    attributes: { class: 'nav-item--danger' },
  },
];
