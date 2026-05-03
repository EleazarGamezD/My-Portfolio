import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { AlertModule, BadgeModule, ButtonModule, CardModule } from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-testimonial-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AlertModule, BadgeModule, ButtonModule, CardModule],
  templateUrl: './testimonial-details-page.component.html',
  styleUrl: './testimonial-details-page.component.scss',
})
export class AdminTestimonialDetailsPageComponent implements OnInit {
  testimonialId = '';
  item: IApiContentItem | null = null;
  loading = false;
  actionLoading = false;
  notFound = false;
  error: string | null = null;

  constructor(
    private readonly contentService: ContentService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly i18nService: I18nService,
    private readonly toastr: ToastrService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.testimonialId = this.route.snapshot.paramMap.get('id') || '';
    await this.loadTestimonial();
  }

  get personName(): string {
    if (!this.item) {
      return '';
    }

    const value = this.item.metadata?.['name'];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    return this.i18nService.selectText(
      this.item.label?.es || '',
      this.item.label?.en || this.item.label?.es || '',
    ) || '';
  }

  get personPosition(): string {
    const value = this.item?.metadata?.['position'];
    return typeof value === 'string' ? value : '';
  }

  get personCompany(): string {
    const value = this.item?.metadata?.['company'];
    return typeof value === 'string' ? value : '';
  }

  get testimonialEs(): string {
    return this.item?.description?.es || '';
  }

  get testimonialEn(): string {
    return this.item?.description?.en || '';
  }

  get activeLabel(): string {
    return this.item?.active ? 'Activo' : 'Inactivo';
  }

  get activeColor(): 'success' | 'secondary' {
    return this.item?.active ? 'success' : 'secondary';
  }

  async toggleActive(): Promise<void> {
    if (!this.item?._id) {
      return;
    }

    this.actionLoading = true;

    try {
      this.item = await this.contentService.updateContentItem<IApiContentItem>('testimonials', this.item._id, {
        ...this.item,
        active: !this.item.active,
      });
      this.toastr.success('Estado del testimonio actualizado.', 'Dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el estado del testimonio.';
      this.toastr.error(message, 'Dashboard');
    } finally {
      this.actionLoading = false;
      this.cdr.detectChanges();
    }
  }

  async deleteItem(): Promise<void> {
    if (!this.item?._id) {
      return;
    }

    this.actionLoading = true;

    try {
      await this.contentService.deleteContentItem('testimonials', this.item._id);
      this.toastr.success('Testimonio eliminado.', 'Dashboard');
      await this.router.navigate(['/admin/dashboard/testimonials']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar el testimonio.';
      this.toastr.error(message, 'Dashboard');
    } finally {
      this.actionLoading = false;
      this.cdr.detectChanges();
    }
  }

  private async loadTestimonial(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const items = await this.contentService.getTestimonials();
      this.item = items.find((entry) => entry._id === this.testimonialId) || null;

      if (!this.item) {
        this.notFound = true;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'No se pudo cargar el testimonio.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
