import { environment } from "../../../../environments/environment.example";


export const API_CONTENT_ROUTES = {
  getProfile: `${environment.apiUrl}/content/profile`,
  updateProfile: `${environment.apiUrl}/content/profile`,
  getTechSkills: `${environment.apiUrl}/content/techSkills`,
  getExperience: `${environment.apiUrl}/content/experience`,
  getSocialLinks: `${environment.apiUrl}/content/socialLinks`,
  getTestimonials: `${environment.apiUrl}/content/testimonials`,
  getResumes: `${environment.apiUrl}/content/resumes`,
  getResource: (resourceName: string) => `${environment.apiUrl}/content/${resourceName}`,
  updateResourceItem: (resourceName: string, id: string) => `${environment.apiUrl}/content/${resourceName}/${id}`,
  deleteResourceItem: (resourceName: string, id: string) => `${environment.apiUrl}/content/${resourceName}/${id}`,
};
