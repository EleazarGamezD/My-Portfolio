import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { IPaginationResponse } from '@core/interfaces/projects/projects.interfaces';
import { ContentService } from '@core/services/content/content.service';
import { AlertModule } from '@coreui/angular';
import { TestimonialsListComponent } from '@pages/admin-dashboard/components/testimonials-list/testimonials-list.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-testimonials-page',
  standalone: true,
  imports: [CommonModule, AlertModule, TestimonialsListComponent],
  templateUrl: './testimonials-page.component.html',
})
export class AdminTestimonialsPageComponent implements OnInit {
  items: IApiContentItem[] = [];
  loading = false;
  error: string | null = null;
  actionLoadingKey: string | null = null;
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
    private readonly toastr: ToastrService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadPage(1);
  }

  async onPageChange(page: number): Promise<void> {
    await this.loadPage(page);
  }

  async onDelete(item: IApiContentItem): Promise<void> {
    if (!item._id) {
      return;
    }

    this.actionLoadingKey = `testimonial-delete-${item._id}`;

    try {
      await this.contentService.deleteContentItem('testimonials', item._id);
      this.toastr.success('Testimonio eliminado.', 'Dashboard');

      const targetPage =
        this.items.length === 1 && this.pagination.currentPage > 1
          ? this.pagination.currentPage - 1
          : this.pagination.currentPage;

      await this.loadPage(targetPage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar el testimonio.';
      this.toastr.error(message, 'Dashboard');
    } finally {
      this.actionLoadingKey = null;
    }
  }

  async onToggleActive(item: IApiContentItem): Promise<void> {
    if (!item._id) {
      return;
    }

    this.actionLoadingKey = `testimonial-save-${item._id}`;

    try {
      await this.contentService.updateContentItem<IApiContentItem>('testimonials', item._id, {
        ...item,
        active: !item.active,
      });
      this.toastr.success('Estado del testimonio actualizado.', 'Dashboard');
      await this.loadPage(this.pagination.currentPage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el testimonio.';
      this.toastr.error(message, 'Dashboard');
    } finally {
      this.actionLoadingKey = null;
    }
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
      this.error = error instanceof Error ? error.message : 'No se pudieron cargar los testimonios.';
      this.items = [];
    } finally {
      this.loading = false;
    }
  }
}
