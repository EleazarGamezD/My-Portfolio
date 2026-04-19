import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { IProject } from '@core/interfaces/projects/projects.interfaces';
import { API_PROJECT_ROUTES } from '@core/routes/projects/projects.routes';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

interface IApiProject {
  _id?: string;
  slug?: string;
  title?: {
    es?: string;
    en?: string;
  };
  summary?: {
    es?: string;
    en?: string;
  };
  description?: {
    es?: string;
    en?: string;
  };
  stack?: string[];
  images?: Array<string | { url?: string; base64?: string }>;
  coverImage?: string | { url?: string; base64?: string } | null;
  projectLink?: string;
  codeLink?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectsService extends GlobalHttpService {
  async getProjects(): Promise<IProject[]> {
    const projects = await this.makeRequest<IApiProject[], null>(
      API_PROJECT_ROUTES.getProjects,
      null,
      RequestMethod.GET,
    );

    return projects.map((project, index) => this.mapApiProject(project, index));
  }

  private mapApiProject(project: IApiProject, index: number): IProject {
    const images = this.normalizeImages(project);
    const technologies = Array.isArray(project.stack) ? project.stack.join(', ') : '';

    return {
      id: index + 1,
      slug: project.slug || project._id || `${index + 1}`,
      icon: '',
      images,
      titleEs: project.title?.es || '',
      titleEn: project.title?.en || project.title?.es || '',
      descriptionEs: project.description?.es || project.summary?.es || '',
      descriptionEn: project.description?.en || project.summary?.en || project.description?.es || '',
      resume: project.summary?.es || '',
      technologiesEs: technologies,
      technologiesEn: technologies,
      projectLink: project.projectLink || '',
      codeLink: project.codeLink || '',
    };
  }

  private normalizeImages(project: IApiProject): string[] {
    const rawImages = Array.isArray(project.images) ? project.images : [];

    const normalizedImages = rawImages
      .map((image) => {
        if (typeof image === 'string') {
          return image;
        }

        if (image?.url) {
          return image.url;
        }

        if (image?.base64) {
          return image.base64;
        }

        return '';
      })
      .filter(Boolean);

    if (normalizedImages.length > 0) {
      return normalizedImages;
    }

    if (typeof project.coverImage === 'string' && project.coverImage) {
      return [project.coverImage];
    }

    if (project.coverImage && typeof project.coverImage === 'object') {
      if (project.coverImage.url) {
        return [project.coverImage.url];
      }

      if (project.coverImage.base64) {
        return [project.coverImage.base64];
      }
    }

    return ['/assets/images/shared/backgrounds/desktop-v3.webp'];
  }
}
