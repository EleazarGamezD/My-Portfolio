import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { IPaginationResponse } from '@core/interfaces/projects/projects.interfaces';
import { ContentService } from '@core/services/content/content.service';
import { AlertModule } from '@coreui/angular';
import { TestimonialsListComponent } from '@pages/admin-dashboard/components/testimonials-list/testimonials-list.component';

@Component({
  selector: 'app-admin-testimonials-page',
  standalone: true,
  imports: [AlertModule, TestimonialsListComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './testimonials-page.component.html',
})
export class AdminTestimonialsPageComponent implements OnInit {
  items: IApiContentItem[] = [];
  loading = false;
  error: string | null = null;
  pagination: IPaginationResponse<IApiContentItem> = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  private readonly pageSize = 10;

  constructor(
    private readonly contentService: ContentService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadPage(1);
  }

  async onPageChange(page: number): Promise<void> {
    await this.loadPage(page);
  }

  private async loadPage(page: number): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const response = await this.contentService.getTestimonialsPaginated({
        page,
        limit: this.pageSize,
        sortBy: 'order',
        sortOrder: 'asc',
      });

      this.items = response.data;
      this.pagination = response;
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los testimonios.';
      this.items = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
