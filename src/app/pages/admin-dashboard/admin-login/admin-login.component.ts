import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;
  infoMessage: string | null = null;
  private readonly adminStylesheetId = 'admin-coreui-stylesheet';

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    public readonly i18nService: I18nService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.enableAdminThemeContext();
    this.infoMessage = this.route.snapshot.queryParamMap.get('sessionExpired')
      ? 'La sesión expiró o ya no es válida. Ingresa de nuevo para volver al dashboard.'
      : null;

    if (await this.adminAuthService.isAuthenticated()) {
      await this.router.navigateByUrl(this.getRedirectTarget());
    }
  }

  ngOnDestroy(): void {
    this.disableAdminThemeContext();
  }

  async login(): Promise<void> {
    if (!this.email || !this.password || this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const response = await this.adminAuthService.login(
        this.email,
        this.password,
      );
      if (response.mustChangePassword) {
        await this.router.navigateByUrl('/admin/setup-account');
      } else {
        await this.router.navigateByUrl(this.getRedirectTarget());
      }
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to authenticate admin user.';
    } finally {
      this.loading = false;
    }
  }

  private getRedirectTarget(): string {
    return (
      this.route.snapshot.queryParamMap.get('redirectTo') ||
      '/admin/dashboard/overview'
    );
  }
  private enableAdminThemeContext(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.classList.add('admin-route-active');
    document.body.classList.add('admin-route-active');

    const existingLink = document.getElementById(
      this.adminStylesheetId,
    ) as HTMLLinkElement | null;
    if (existingLink) {
      return;
    }

    const link = document.createElement('link');
    link.id = this.adminStylesheetId;
    link.rel = 'stylesheet';
    link.href = 'admin-coreui.css';
    document.head.appendChild(link);
  }

  private disableAdminThemeContext(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.classList.remove('admin-route-active');
    document.body.classList.remove('admin-route-active');
    document.getElementById(this.adminStylesheetId)?.remove();
  }
}
