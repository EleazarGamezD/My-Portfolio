export type ContentResourceName =
  | 'techSkills'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'testimonials'
  | 'resumes'
  | 'socialLinks';

export type AdminContentSectionVariant =
  | 'skills'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'testimonials'
  | 'socialLinks';

export type ContentResourcePage = Exclude<ContentResourceName, 'resumes'>;

export type OrderedCvContentVariant = 'education' | 'certifications';

export type ResumeLanguage = 'es' | 'en';

export interface AdminConfirmationDialog {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
}

export interface AdminContentPageData {
  resourceName: ContentResourcePage;
  variant: AdminContentSectionVariant;
  sectionTitle: string;
  createTitle: string;
  emptyMessage: string;
  kicker: string;
  description: string;
}

export interface DangerAction {
  id: string;
  title: string;
  description: string;
  confirmTitle: string;
  confirmBody: string;
  buttonLabel: string;
  isForce?: boolean;
}

export interface ExperienceReorderEvent {
  previousIndex: number;
  currentIndex: number;
}

export interface OrderedCvContentReorderEvent {
  previousIndex: number;
  currentIndex: number;
}

export interface ResumeSlotDraft {
  language: ResumeLanguage;
  heading: string;
  title: string;
  description: string;
  order: number;
  itemId: string | null;
  fileName: string;
  mimeType: string;
  base64: string;
  downloadUrl: string;
  metadata: Record<string, unknown>;
}
