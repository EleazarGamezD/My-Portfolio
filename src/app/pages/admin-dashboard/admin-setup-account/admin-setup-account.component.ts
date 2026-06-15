
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';

@Component({
  selector: 'app-admin-setup-account',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-setup-account.component.html',
  styleUrl: './admin-setup-account.component.scss',
})
export class AdminSetupAccountComponent implements OnInit, OnDestroy {
  email = '';
  username = '';
  displayName = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error: string | null = null;
  private readonly adminStylesheetId = 'admin-coreui-stylesheet';

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.enableAdminThemeContext();
  }

  ngOnDestroy(): void {
    this.disableAdminThemeContext();
  }

  async submit(): Promise<void> {
    if (!this.email || !this.username || !this.displayName || !this.password || this.loading) {
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      await this.adminAuthService.setupAccount({
        email: this.email,
        username: this.username,
        displayName: this.displayName,
        password: this.password,
      });
      await this.router.navigateByUrl('/admin/dashboard/overview');
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Error al configurar la cuenta.';
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
