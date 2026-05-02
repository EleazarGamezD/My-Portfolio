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
  { key: 'overview', label: 'Resumen', icon: 'cilSpeedometer' },
  { key: 'projects', label: 'Proyectos', icon: 'cilCode' },
  { key: 'profile', label: 'Perfil', icon: 'cilUser' },
  { key: 'skills', label: 'Skills', icon: 'cilStar' },
  { key: 'experience', label: 'Experiencia', icon: 'cilDescription' },
  { key: 'testimonials', label: 'Testimonios', icon: 'cilSpeech' },
  { key: 'resumes', label: 'Hojas de vida', icon: 'cilCloudDownload' },
  { key: 'socialLinks', label: 'Redes sociales', icon: 'cilShareBoxed' },
  { key: 'users', label: 'Usuarios', icon: 'cilPeople' },
];

export function isAdminSection(value: string | null | undefined): value is AdminSection {
  return ADMIN_SECTIONS.some((section) => section.key === value);
}
