export type AdminSection =
  | 'overview'
  | 'projects'
  | 'profile'
  | 'skills'
  | 'experience'
  | 'testimonials'
  | 'resumes'
  | 'socialLinks'
  | 'users';

export const ADMIN_SECTIONS: Array<{ key: AdminSection; label: string; icon: string }> = [
  { key: 'overview', label: 'Overview', icon: 'cilSpeedometer' },
  { key: 'projects', label: 'Projects', icon: 'cilCode' },
  { key: 'profile', label: 'Profile', icon: 'cilUser' },
  { key: 'skills', label: 'Skills', icon: 'cilStar' },
  { key: 'experience', label: 'Experience', icon: 'cilDescription' },
  { key: 'testimonials', label: 'Testimonials', icon: 'cilSpeech' },
  { key: 'resumes', label: 'Resumes', icon: 'cilCloudDownload' },
  { key: 'socialLinks', label: 'Social Links', icon: 'cilShareBoxed' },
  { key: 'users', label: 'Users', icon: 'cilPeople' },
];

export function isAdminSection(value: string | null | undefined): value is AdminSection {
  return ADMIN_SECTIONS.some((section) => section.key === value);
}
