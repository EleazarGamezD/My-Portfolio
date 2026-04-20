import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { IconDirective } from '@coreui/icons-angular';
import {
  BreadcrumbModule,
  ButtonModule,
  ContainerComponent,
  HeaderTogglerDirective,
  INavData,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective,
} from '@coreui/angular';
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
export class AdminLayoutComponent implements OnInit {
  readonly navItems: INavData[] = adminNavItems;
  currentYear = new Date().getFullYear();
  currentSectionLabel = 'Overview';

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly router: Router,
    public readonly facade: AdminDashboardFacade,
  ) {}

  async ngOnInit(): Promise<void> {
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

  async logout(): Promise<void> {
    await this.adminAuthService.logout();
    await this.router.navigate(['/admin/login'], {
      queryParams: { redirectTo: '/admin/dashboard/overview' },
    });
  }

  private syncSectionFromUrl(url: string): void {
    const sectionKey = url.split('/').pop() ?? 'overview';

    if (!isAdminSection(sectionKey)) {
      this.currentSectionLabel = 'Overview';
      return;
    }

    this.currentSectionLabel =
      ADMIN_SECTIONS.find((section) => section.key === sectionKey)?.label ?? 'Overview';
  }
}
