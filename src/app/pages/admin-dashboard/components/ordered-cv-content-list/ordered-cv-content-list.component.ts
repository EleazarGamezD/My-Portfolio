import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { I18nService } from '@core/services/i18n/i18n.service';
import { SpinnerModule, TableModule } from '@coreui/angular';
import { AdminActionMenuAction, AdminActionMenuComponent } from '../admin-action-menu/admin-action-menu.component';

export type OrderedCvContentVariant = 'education' | 'certifications';

interface OrderedCvContentReorderEvent {
  previousIndex: number;
  currentIndex: number;
}

@Component({
  selector: 'app-ordered-cv-content-list',
  standalone: true,
  imports: [RouterLink, DragDropModule, SpinnerModule, TableModule, AdminActionMenuComponent],
  templateUrl: './ordered-cv-content-list.component.html',
  styleUrl: './ordered-cv-content-list.component.scss',
})
export class OrderedCvContentListComponent {
  @Input({ required: true }) variant!: OrderedCvContentVariant;
  @Input() items: IApiContentItem[] = [];
  @Input() loading = false;
  @Input() actionLoadingKey: string | null = null;

  @Output() deleteItem = new EventEmitter<IApiContentItem>();
  @Output() reorderItems = new EventEmitter<OrderedCvContentReorderEvent>();

  constructor(private readonly i18nService: I18nService) {}

  get kicker(): string {
    return this.variant === 'education' ? 'CV academico' : 'Credenciales verificables';
  }

  get title(): string {
    return this.variant === 'education' ? 'Educacion' : 'Certificados';
  }

  get copy(): string {
    return this.variant === 'education'
      ? 'Arrastra cada fila para ordenar los estudios en el CV generado. Crear y editar se manejan desde su propio formulario.'
      : 'Arrastra cada fila para ordenar las credenciales en el CV generado. Crear y editar se manejan desde su propio formulario.';
  }

  get createLabel(): string {
    return this.variant === 'education' ? 'Crear educacion' : 'Crear certificado';
  }

  get loadingLabel(): string {
    return this.variant === 'education' ? 'Cargando educacion...' : 'Cargando certificados...';
  }

  get emptyLabel(): string {
    return this.variant === 'education' ? 'No hay educacion cargada.' : 'No hay certificados cargados.';
  }

  get createLink(): (string | number)[] {
    return ['/admin/dashboard', this.variant, 'create'];
  }

  get firstColumnLabel(): string {
    return this.variant === 'education' ? 'Institucion' : 'Certificado';
  }

  get secondColumnLabel(): string {
    return this.variant === 'education' ? 'Titulo / programa' : 'Plataforma';
  }

  get dateColumnLabel(): string {
    return this.variant === 'education' ? 'Periodo' : 'Fecha emision';
  }

  getItemName(item: IApiContentItem): string {
    return this.variant === 'education'
      ? this.selectText(item.label) || '-'
      : this.selectText(item.title) || '-';
  }

  getSecondaryText(item: IApiContentItem): string {
    return this.variant === 'education'
      ? this.selectText(item.title) || '-'
      : this.selectText(item.label) || '-';
  }

  getDateText(item: IApiContentItem): string {
    if (this.variant === 'education') {
      if (!item.period?.start) {
        return '-';
      }

      return item.period.current || !item.period.end
        ? `${item.period.start} - Actual`
        : `${item.period.start} - ${item.period.end}`;
    }

    const issuedAt = item.metadata?.['issuedAt'];
    return typeof issuedAt === 'string' && issuedAt.trim() ? issuedAt.trim() : '-';
  }

  getDetailText(item: IApiContentItem): string {
    if (this.variant === 'education') {
      return this.selectText(item.description) || '-';
    }

    const credentialId = item.metadata?.['credentialId'];
    return typeof credentialId === 'string' && credentialId.trim() ? credentialId.trim() : '-';
  }

  getDetailColumnLabel(): string {
    return this.variant === 'education' ? 'Notas' : 'Credencial';
  }

  getEditLink(item: IApiContentItem): (string | number)[] {
    return ['/admin/dashboard', this.variant, 'edit', item._id || ''];
  }

  isReordering(): boolean {
    return this.actionLoadingKey === `${this.variant}-reorder`;
  }

  handleAction(item: IApiContentItem, action: AdminActionMenuAction): void {
    if (action === 'delete') {
      this.deleteItem.emit(item);
    }
  }

  onDrop(event: CdkDragDrop<IApiContentItem[]>): void {
    if (event.previousIndex === event.currentIndex || this.isReordering()) {
      return;
    }

    this.reorderItems.emit({
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    });
  }

  private selectText(value?: { es?: string; en?: string }): string {
    return this.i18nService.selectText(
      value?.es || '',
      value?.en || value?.es || '',
    );
  }
}
