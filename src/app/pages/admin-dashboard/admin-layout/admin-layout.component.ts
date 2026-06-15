import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import {
  BreadcrumbModule,
  ButtonModule,
  ContainerComponent,
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
import { Subscription, filter } from 'rxjs';
import { ADMIN_SECTIONS, isAdminSection } from '../admin-sections';
import { adminNavItems } from './admin-layout.nav';
import { DefaultFooterComponent } from './default-footer/default-footer.component';
import { DefaultHeaderComponent } from './default-header/default-header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
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
    ShadowOnScrollDirective,
    NgScrollbar,
    IconDirective,
    DefaultHeaderComponent,
    DefaultFooterComponent,
  ],
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  readonly navItems: INavData[] = adminNavItems;
  private readonly adminStylesheetId = 'admin-coreui-stylesheet';
  private readonly subscriptions = new Subscription();
  @ViewChild('adminSidebar') adminSidebar?: SidebarComponent;
  currentYear = new Date().getFullYear();
  currentSectionLabel = 'Overview';

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly router: Router,
    public readonly facade: AdminDashboardFacade,
  ) {}

  async ngOnInit(): Promise<void> {
    this.enableAdminThemeStyles();
    this.enableAdminScrolling();

    try {
      await this.facade.ensureCurrentAdmin();
      this.syncSectionFromUrl(this.router.url);
      this.subscriptions.add(
        this.router.events
          .pipe(
            filter(
              (event): event is NavigationEnd => event instanceof NavigationEnd,
            ),
          )
          .subscribe((event) => {
            this.syncSectionFromUrl(event.urlAfterRedirects);
            this.closeMobileSidebar();
          }),
      );
      this.subscriptions.add(
        this.adminAuthService
          .watchStorage(NgStorage.TOKEN)
          .subscribe((token) => {
            if (!token) {
              void this.router.navigate(['/admin/login'], {
                queryParams: {
                  sessionExpired: '1',
                  redirectTo: this.router.url,
                },
              });
            }
          }),
      );
    } catch (error) {
      console.error('Failed to load current admin for layout:', error);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.disableAdminScrolling();
    this.disableAdminThemeStyles();
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
    const sectionKey =
      dashboardIndex >= 0
        ? (segments[dashboardIndex + 1] ?? 'overview')
        : 'overview';

    if (!isAdminSection(sectionKey)) {
      this.currentSectionLabel = 'Overview';
      return;
    }

    this.currentSectionLabel =
      ADMIN_SECTIONS.find((section) => section.key === sectionKey)?.label ??
      'Overview';
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

  private enableAdminThemeStyles(): void {
    if (typeof document === 'undefined') {
      return;
    }

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

  private disableAdminThemeStyles(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.getElementById(this.adminStylesheetId)?.remove();
  }

  private closeMobileSidebar(): void {
    if (
      typeof window === 'undefined' ||
      window.innerWidth >= 992 ||
      !this.adminSidebar
    ) {
      return;
    }

    this.adminSidebar.visible = false;
  }
}
