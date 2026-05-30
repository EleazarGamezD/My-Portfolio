import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class AdminLoginComponent implements OnInit {
    email = '';
    password = '';
    loading = false;
    error: string | null = null;

    constructor(
        private readonly adminAuthService: AdminAuthService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        public readonly i18nService: I18nService,
    ) { }

    async ngOnInit(): Promise<void> {
        if (await this.adminAuthService.isAuthenticated()) {
            await this.router.navigateByUrl(this.getRedirectTarget());
        }
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
}
