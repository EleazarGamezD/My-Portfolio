import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
} from '@coreui/angular';

export type AdminActionMenuAction = 'edit' | 'delete' | 'deactivate';

@Component({
  selector: 'app-admin-action-menu',
  standalone: true,
  imports: [
    RouterLink,
    DropdownComponent,
    ButtonDirective,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    IconDirective,
  ],
  templateUrl: './admin-action-menu.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-action-menu.component.scss',
})
export class AdminActionMenuComponent {
  @Input() canEdit = true;
  @Input() canDelete = true;
  @Input() canDeactivate = true;
  @Input() deactivateLabel = 'Desactivar';
  @Input() editLink: (string | number)[] | null = null;
  @Output() actionSelected = new EventEmitter<AdminActionMenuAction>();

  onAction(action: AdminActionMenuAction, event: Event): void {
    event.preventDefault();
    this.actionSelected.emit(action);
  }
}
