import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
    CommonModule,
    DropdownComponent,
    ButtonDirective,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    IconDirective,
  ],
  templateUrl: './admin-action-menu.component.html',
  styleUrl: './admin-action-menu.component.scss',
})
export class AdminActionMenuComponent {
  @Input() canEdit = true;
  @Input() canDelete = true;
  @Input() canDeactivate = true;
  @Output() actionSelected = new EventEmitter<AdminActionMenuAction>();

  onAction(action: AdminActionMenuAction, event: Event): void {
    event.preventDefault();
    this.actionSelected.emit(action);
  }
}
