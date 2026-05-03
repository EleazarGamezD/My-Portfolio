import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { IPaginationResponse } from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';
import { BadgeModule, ButtonModule, SpinnerModule, TableModule } from '@coreui/angular';

@Component({
  selector: 'app-testimonials-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableModule,
    ButtonModule,
    BadgeModule,
    SpinnerModule,
  ],
  templateUrl: './testimonials-list.component.html',
  styleUrl: './testimonials-list.component.scss',
})
export class TestimonialsListComponent {
  @Input() items: IApiContentItem[] = [];
  @Input() loading = false;
  @Input() pagination: IPaginationResponse<IApiContentItem> = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
  @Output() pageChange = new EventEmitter<number>();

  constructor(private readonly i18nService: I18nService) {}

  get visiblePages(): number[] {
    if (this.pagination.totalPages <= 1) {
      return this.pagination.totalPages === 1 ? [1] : [];
    }

    const startPage = Math.max(1, this.pagination.currentPage - 2);
    const endPage = Math.min(this.pagination.totalPages, startPage + 4);
    const adjustedStart = Math.max(1, endPage - 4);
    const pages: number[] = [];

    for (let page = adjustedStart; page <= endPage; page += 1) {
      pages.push(page);
    }

    return pages;
  }

  getName(item: IApiContentItem): string {
    const metadataName = item.metadata?.['name'];
    if (typeof metadataName === 'string' && metadataName.trim()) {
      return metadataName;
    }

    return this.i18nService.selectText(
      item.label?.es || '',
      item.label?.en || item.label?.es || '',
    ) || '-';
  }

  getPosition(item: IApiContentItem): string {
    const value = item.metadata?.['position'];
    return typeof value === 'string' && value.trim() ? value : '-';
  }

  getCompany(item: IApiContentItem): string {
    const value = item.metadata?.['company'];
    return typeof value === 'string' && value.trim() ? value : '-';
  }

  getActiveColor(item: IApiContentItem): 'success' | 'secondary' {
    return item.active ? 'success' : 'secondary';
  }

  changePage(page: number): void {
    if (page < 1 || page > this.pagination.totalPages || page === this.pagination.currentPage) {
      return;
    }

    this.pageChange.emit(page);
  }
}
