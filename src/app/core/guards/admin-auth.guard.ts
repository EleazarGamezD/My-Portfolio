import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';

export const adminAuthGuard: CanActivateFn = async (_route, state) => {
    const adminAuthService = inject(AdminAuthService);
    const router = inject(Router);
    const authenticated = await adminAuthService.isAuthenticated();

    if (authenticated) {
        return true;
    }

    return router.createUrlTree(['/admin/login'], {
        queryParams: { redirectTo: state.url },
    });
};
