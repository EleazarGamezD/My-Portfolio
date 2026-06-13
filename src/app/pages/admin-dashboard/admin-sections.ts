export type AdminSection =
  | 'overview'
  | 'projects'
  | 'profile'
  | 'media'
  | 'skills'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'testimonials'
  | 'resumes'
  | 'socialLinks'
  | 'users'
  | 'themes'
  | 'dangerZone';

export const ADMIN_SECTIONS: Array<{ key: AdminSection; label: string; icon: string }> = [
  { key: 'overview', label: 'Resumen', icon: 'cilSpeedometer' },
  { key: 'projects', label: 'Proyectos', icon: 'cilCode' },
  { key: 'profile', label: 'Perfil', icon: 'cilUser' },
  { key: 'media', label: 'Media', icon: 'cilImage' },
  { key: 'skills', label: 'Skills', icon: 'cilStar' },
  { key: 'experience', label: 'Experiencia', icon: 'cilDescription' },
  { key: 'education', label: 'Educación', icon: 'cilDescription' },
  { key: 'certifications', label: 'Certificados', icon: 'cilStar' },
  { key: 'testimonials', label: 'Testimonios', icon: 'cilSpeech' },
  { key: 'resumes', label: 'Hojas de vida', icon: 'cilCloudDownload' },
  { key: 'socialLinks', label: 'Redes sociales', icon: 'cilShareBoxed' },
  { key: 'users', label: 'Usuarios', icon: 'cilPeople' },
  { key: 'themes', label: 'Temas', icon: 'cilPaint' },
  { key: 'dangerZone', label: 'Zona de peligro', icon: 'cilWarning' },
];

export function isAdminSection(value: string | null | undefined): value is AdminSection {
  return ADMIN_SECTIONS.some((section) => section.key === value);
}
