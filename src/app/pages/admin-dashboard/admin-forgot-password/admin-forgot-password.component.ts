
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';

@Component({
  selector: 'app-admin-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-forgot-password.component.html',
  styleUrl: './admin-forgot-password.component.scss',
})
export class AdminForgotPasswordComponent implements OnInit, OnDestroy {
  email = '';
  loading = false;
  error: string | null = null;
  sent = false;
  private readonly adminStylesheetId = 'admin-coreui-stylesheet';

  constructor(private readonly adminAuthService: AdminAuthService) {}

  ngOnInit(): void {
    this.enableAdminThemeContext();
  }

  ngOnDestroy(): void {
    this.disableAdminThemeContext();
  }

  async submit(): Promise<void> {
    if (!this.email || this.loading) return;
    this.loading = true;
    this.error = null;
    try {
      await this.adminAuthService.forgotPassword(this.email);
      this.sent = true;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Error al enviar el email.';
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
