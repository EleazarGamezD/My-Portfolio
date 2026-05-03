import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IAdminUser } from '@core/interfaces/admin/admin.interface';
import {
    BadgeModule,
    ButtonModule,
    CardModule,
    FormModule,
    SpinnerModule,
    TableModule,
} from '@coreui/angular';

@Component({
    selector: 'app-admin-users-section',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BadgeModule,
        ButtonModule,
        CardModule,
        FormModule,
        SpinnerModule,
        TableModule,
    ],
    templateUrl: './users-section.component.html',
    styleUrl: './users-section.component.scss',
})
export class AdminUsersSectionComponent {
    @Input() adminUsers: IAdminUser[] = [];
    @Input() contentLoading = false;
    @Input() currentAdminId: string | undefined;
    @Input() actionLoadingKey: string | null = null;
    @Output() saveUser = new EventEmitter<IAdminUser>();

    isCurrentAdmin(user: IAdminUser): boolean {
        return Boolean(this.currentAdminId && user._id === this.currentAdminId);
    }

    isActionLoading(user: IAdminUser): boolean {
        return this.actionLoadingKey === `admin-user-save-${user._id}`;
    }

    getRoleColor(role?: string): 'danger' | 'primary' | 'info' | 'secondary' {
        switch (role) {
            case 'super_admin':
                return 'danger';
            case 'admin':
                return 'primary';
            case 'editor':
                return 'info';
            default:
                return 'secondary';
        }
    }
}
