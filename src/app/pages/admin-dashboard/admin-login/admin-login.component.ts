import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-login.component.html',
    styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent implements OnInit, OnDestroy {
    email = '';
    password = '';
    loading = false;
    error: string | null = null;
    private readonly adminStylesheetId = 'admin-coreui-stylesheet';

    constructor(
        private readonly adminAuthService: AdminAuthService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        public readonly i18nService: I18nService,
    ) { }

    async ngOnInit(): Promise<void> {
        this.enableAdminThemeContext();

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
            await this.adminAuthService.login(this.email, this.password);
            await this.router.navigateByUrl(this.getRedirectTarget());
        } catch (error) {
            this.error = error instanceof Error ? error.message : 'Failed to authenticate admin user.';
        } finally {
            this.loading = false;
        }
    }

    private getRedirectTarget(): string {
        return this.route.snapshot.queryParamMap.get('redirectTo') || '/admin/dashboard/overview';
    }

    private enableAdminThemeContext(): void {
        if (typeof document === 'undefined') {
            return;
        }

        document.documentElement.classList.add('admin-route-active');
        document.body.classList.add('admin-route-active');

        const existingLink = document.getElementById(this.adminStylesheetId) as HTMLLinkElement | null;
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
