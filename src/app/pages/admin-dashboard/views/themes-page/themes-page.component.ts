import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DEFAULT_THEME_COLORS, FONT_OPTIONS, ITheme, IThemeColors } from '@core/interfaces/theme/theme.interface';
import { ThemeService } from '@core/services/theme/theme.service';
import {
  BadgeComponent,
  ButtonModule,
  CardModule,
  SpinnerComponent,
} from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';

function blankColors(): IThemeColors {
  return { ...DEFAULT_THEME_COLORS };
}

@Component({
  selector: 'app-admin-themes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, BadgeComponent, SpinnerComponent],
  templateUrl: './themes-page.component.html',
  styleUrl: './themes-page.component.scss',
})
export class AdminThemesPageComponent implements OnInit {
  readonly fontOptions = FONT_OPTIONS;

  themes: ITheme[] = [];
  loading = true;
  actionLoadingId: string | null = null;

  showCreateForm = false;
  newThemeName = '';
  newThemeColors: IThemeColors = blankColors();

  editingId: string | null = null;
  editName = '';
  editColors: IThemeColors = blankColors();

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

  async createTheme(): Promise<void> {
    if (!this.newThemeName.trim() || !this.newThemeColors.baseColor.trim()) return;
    this.actionLoadingId = 'create';
    try {
      await this.themeService.createTheme({
        name: this.newThemeName.trim(),
        colors: { ...this.newThemeColors },
      });
      this.toastr.success('Tema creado.', 'Panel');
      this.newThemeName = '';
      this.newThemeColors = blankColors();
      this.showCreateForm = false;
      await this.loadThemes();
    } catch {
      this.toastr.error('No se pudo crear el tema.', 'Panel');
    } finally {
      this.actionLoadingId = null;
      this.cdr.detectChanges();
    }
  }

  startEdit(theme: ITheme): void {
    this.editingId = theme._id ?? null;
    this.editName = theme.name;
    this.editColors = { ...DEFAULT_THEME_COLORS, ...theme.colors };
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  async saveEdit(theme: ITheme): Promise<void> {
    if (!theme._id) return;
    this.actionLoadingId = theme._id;
    try {
      await this.themeService.updateTheme(theme._id, {
        name: this.editName.trim(),
        colors: { ...this.editColors },
      });
      this.toastr.success('Tema actualizado.', 'Panel');
      this.editingId = null;
      await this.loadThemes();
    } catch {
      this.toastr.error('No se pudo actualizar el tema.', 'Panel');
    } finally {
      this.actionLoadingId = null;
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
