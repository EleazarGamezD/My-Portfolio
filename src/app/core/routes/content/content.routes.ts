import { environment } from 'src/environments/environment';

export const API_CONTENT_ROUTES = {
  getProfile: `${environment.apiUrl}/content/profile`,
  getTechSkills: `${environment.apiUrl}/content/techSkills`,
  getExperience: `${environment.apiUrl}/content/experience`,
  getSocialLinks: `${environment.apiUrl}/content/socialLinks`,
  getTestimonials: `${environment.apiUrl}/content/testimonials`,
  getResumes: `${environment.apiUrl}/content/resumes`,
};
