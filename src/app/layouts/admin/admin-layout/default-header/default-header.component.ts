import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import {
  BreadcrumbComponent,
  BreadcrumbItemComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  SidebarToggleDirective,
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ContainerComponent,
    HeaderTogglerDirective,
    SidebarToggleDirective,
    IconDirective,
    HeaderNavComponent,
    NavItemComponent,
    NavLinkDirective,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    BreadcrumbComponent,
    BreadcrumbItemComponent,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownHeaderDirective,
    DropdownItemDirective,
    DropdownDividerDirective,
  ],
})
export class DefaultHeaderComponent extends HeaderComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly #adminAuthService = inject(AdminAuthService);
  readonly #facade = inject(AdminDashboardFacade);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' },
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return (
      this.colorModes.find((mode) => mode.name === currentMode)?.icon ??
      'cilSun'
    );
  });

  constructor() {
    super();
  }

  sidebarId = input('sidebar1');
  currentSectionLabel = input('Overview');

  get currentAdminName(): string {
    return (
      this.#facade.currentAdmin?.displayName ||
      this.#facade.currentAdmin?.email ||
      'Admin user'
    );
  }

  get currentAdminRole(): string {
    return this.#facade.currentAdmin?.role || 'authenticated';
  }

  get userInitials(): string {
    const raw = this.currentAdminName.trim();
    if (!raw) {
      return 'A';
    }

    const parts = raw.split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  async closeSession(): Promise<void> {
    await this.#adminAuthService.logout();
  }
}
