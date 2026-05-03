import { INavData } from '@coreui/angular';
import { ADMIN_SECTIONS } from '@pages/admin-dashboard/admin-sections';

export const adminNavItems: INavData[] = [
  {
    name: 'Admin Overview',
    title: true,
  },
  ...ADMIN_SECTIONS.map((section) => ({
    name: section.label,
    url: `/admin/dashboard/${section.key}`,
    iconComponent: { name: section.icon },
  })),
];
