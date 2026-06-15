import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { I18nService } from '@core/services/i18n/i18n.service';
import { BadgeModule, SpinnerModule, TableModule } from '@coreui/angular';
import {
  AdminActionMenuAction,
  AdminActionMenuComponent,
} from '../admin-action-menu/admin-action-menu.component';

interface ExperienceReorderEvent {
  previousIndex: number;
  currentIndex: number;
}

@Component({
  selector: 'app-experience-list',
  standalone: true,
  imports: [
    RouterLink,
    DragDropModule,
    TableModule,
    BadgeModule,
    SpinnerModule,
    AdminActionMenuComponent,
  ],
  templateUrl: './experience-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './experience-list.component.scss',
})
export class ExperienceListComponent {
  @Input() items: IApiContentItem[] = [];
  @Input() loading = false;
  @Input() actionLoadingKey: string | null = null;

  @Output() deleteExperience = new EventEmitter<IApiContentItem>();
  @Output() reorderExperience = new EventEmitter<ExperienceReorderEvent>();

  constructor(private readonly i18nService: I18nService) {}

  getItemName(item: IApiContentItem): string {
    return (
      this.i18nService.selectText(
        item.label?.es || item.title?.es || '',
        item.label?.en ||
          item.title?.en ||
          item.label?.es ||
          item.title?.es ||
          '',
      ) || '-'
    );
  }

  getDescription(item: IApiContentItem): string {
    return (
      this.i18nService.selectText(
        item.description?.es || '',
        item.description?.en || item.description?.es || '',
      ) || '-'
    );
  }

  getPeriod(item: IApiContentItem): string {
    if (item.period?.start) {
      if (item.period.current || !item.period.end) {
        return `${item.period.start} - Actual`;
      }

      return `${item.period.start} - ${item.period.end}`;
    }

    return typeof item.value === 'string' && item.value.trim()
      ? item.value.trim()
      : '-';
  }

  getEditLink(item: IApiContentItem): (string | number)[] {
    return ['/admin/dashboard/experience/edit', item._id || ''];
  }

  isReordering(): boolean {
    return this.actionLoadingKey === 'experience-reorder';
  }

  handleAction(item: IApiContentItem, action: AdminActionMenuAction): void {
    if (action === 'delete') {
      this.deleteExperience.emit(item);
    }
  }

  onDrop(event: CdkDragDrop<IApiContentItem[]>): void {
    if (event.previousIndex === event.currentIndex || this.isReordering()) {
      return;
    }

    this.reorderExperience.emit({
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    });
  }
}
