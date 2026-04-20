import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { IconDirective } from '@coreui/icons-angular';
import {
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
import { adminNavItems } from './admin-layout.nav';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    IconDirective,
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

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly router: Router,
    public readonly facade: AdminDashboardFacade,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.facade.ensureCurrentAdmin();
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
}
