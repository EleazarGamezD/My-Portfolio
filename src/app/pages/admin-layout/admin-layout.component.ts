import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import {
  BreadcrumbModule,
  ButtonModule,
  ContainerComponent,
  HeaderTogglerDirective,
  INavData,
  ModalModule,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { NgScrollbar } from 'ngx-scrollbar';
import { filter } from 'rxjs';
import { ADMIN_SECTIONS, isAdminSection } from '../admin-dashboard/admin-sections';
import { adminNavItems } from './admin-layout.nav';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    IconDirective,
    BreadcrumbModule,
    ButtonModule,
    ModalModule,
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    ContainerComponent,
    HeaderTogglerDirective,
    ShadowOnScrollDirective,
    NgScrollbar,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  readonly navItems: INavData[] = adminNavItems;
  currentYear = new Date().getFullYear();
  currentSectionLabel = 'Overview';

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly router: Router,
    public readonly facade: AdminDashboardFacade,
  ) { }

  async ngOnInit(): Promise<void> {
    this.enableAdminScrolling();

    try {
      await this.facade.ensureCurrentAdmin();
      this.syncSectionFromUrl(this.router.url);
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      ).subscribe((event) => {
        this.syncSectionFromUrl(event.urlAfterRedirects);
      });
    } catch (error) {
      console.error('Failed to load current admin for layout:', error);
    }
  }

  ngOnDestroy(): void {
    this.disableAdminScrolling();
  }

  async logout(): Promise<void> {
    await this.adminAuthService.logout();
    await this.router.navigate(['/admin/login'], {
      queryParams: { redirectTo: '/admin/dashboard/overview' },
    });
  }

  private syncSectionFromUrl(url: string): void {
    const segments = url.split('/').filter(Boolean);
    const dashboardIndex = segments.indexOf('dashboard');
    const sectionKey = dashboardIndex >= 0 ? segments[dashboardIndex + 1] ?? 'overview' : 'overview';

    if (!isAdminSection(sectionKey)) {
      this.currentSectionLabel = 'Overview';
      return;
    }

    this.currentSectionLabel =
      ADMIN_SECTIONS.find((section) => section.key === sectionKey)?.label ?? 'Overview';
  }

  private enableAdminScrolling(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.classList.add('admin-route-active');
    document.body.classList.add('admin-route-active');
  }

  private disableAdminScrolling(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.classList.remove('admin-route-active');
    document.body.classList.remove('admin-route-active');
  }
}
