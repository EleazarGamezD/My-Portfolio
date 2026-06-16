import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';

@Component({
  selector: 'app-admin-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-reset-password.component.scss',
})
export class AdminResetPasswordComponent implements OnInit, OnDestroy {
  private readonly adminAuthService = inject(AdminAuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  newPassword = '';
  confirmPassword = '';
  loading = false;
  error: string | null = null;
  success = false;
  private token = '';
  private readonly adminStylesheetId = 'admin-coreui-stylesheet';

  ngOnInit(): void {
    this.enableAdminThemeContext();
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.error = 'Token inválido o expirado.';
    }
  }

  ngOnDestroy(): void {
    this.disableAdminThemeContext();
  }

  async submit(): Promise<void> {
    if (!this.newPassword || this.loading || !this.token) return;

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    this.loading = true;
    this.error = null;
    try {
      await this.adminAuthService.resetPassword(this.token, this.newPassword);
      this.success = true;
      setTimeout(() => this.router.navigateByUrl('/admin/login'), 3000);
    } catch (err) {
      this.error =
        err instanceof Error
          ? err.message
          : 'Error al restablecer la contraseña.';
    } finally {
      this.loading = false;
    }
  }

  private enableAdminThemeContext(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.add('admin-route-active');
    document.body.classList.add('admin-route-active');
    const existing = document.getElementById(this.adminStylesheetId);
    if (existing) return;
    const link = document.createElement('link');
    link.id = this.adminStylesheetId;
    link.rel = 'stylesheet';
    link.href = 'admin-coreui.css';
    document.head.appendChild(link);
  }

  private disableAdminThemeContext(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove('admin-route-active');
    document.body.classList.remove('admin-route-active');
    document.getElementById(this.adminStylesheetId)?.remove();
  }
}
