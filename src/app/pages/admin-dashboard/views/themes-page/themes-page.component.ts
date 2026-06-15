import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ITheme } from '@core/interfaces/theme/theme.interface';
import { ThemeService } from '@core/services/theme/theme.service';
import {
  BadgeComponent,
  ButtonModule,
  CardModule,
  SpinnerComponent,
} from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-themes-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, BadgeComponent, SpinnerComponent],
  templateUrl: './themes-page.component.html',
  styleUrl: './themes-page.component.scss',
})
export class AdminThemesPageComponent implements OnInit {
  themes: ITheme[] = [];
  loading = true;
  actionLoadingId: string | null = null;

  constructor(
    private readonly themeService: ThemeService,
    private readonly toastr: ToastrService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadThemes();
  }

  async loadThemes(): Promise<void> {
    this.loading = true;
    try {
      this.themes = await this.themeService.listThemes();
    } catch {
      this.toastr.error('No se pudieron cargar los temas.', 'Panel');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async activateTheme(theme: ITheme): Promise<void> {
    if (!theme._id || theme.active) return;
    this.actionLoadingId = theme._id;
    try {
      const activated = await this.themeService.activateTheme(theme._id);
      this.themeService.applyTheme(activated.colors);
      this.toastr.success(`Tema "${activated.name}" activado.`, 'Panel');
      await this.loadThemes();
    } catch {
      this.toastr.error('No se pudo activar el tema.', 'Panel');
    } finally {
      this.actionLoadingId = null;
      this.cdr.detectChanges();
    }
  }

  async deleteTheme(theme: ITheme): Promise<void> {
    if (!theme._id) return;
    this.actionLoadingId = theme._id;
    try {
      await this.themeService.deleteTheme(theme._id);
      this.toastr.success('Tema eliminado.', 'Panel');
      await this.loadThemes();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo eliminar el tema.';
      this.toastr.error(msg, 'Panel');
    } finally {
      this.actionLoadingId = null;
      this.cdr.detectChanges();
    }
  }
}
