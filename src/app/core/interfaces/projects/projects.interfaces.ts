export interface IProject {
  id: number;
  slug?: string;
  icon: string;
  images: string[];
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  resume: string;
  technologiesEs: string;
  technologiesEn: string;
  projectLink: string;
  codeLink: string;
}
