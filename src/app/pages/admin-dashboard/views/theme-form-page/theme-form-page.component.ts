
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DEFAULT_THEME_COLORS, FONT_OPTIONS, IThemeColors } from '@core/interfaces/theme/theme.interface';
import { ThemeService } from '@core/services/theme/theme.service';
import { AlertModule, ButtonModule, CardModule, FormModule, SpinnerComponent } from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';

type ThemeFormMode = 'create' | 'edit';

export const COLOR_FIELD_META: Array<{ key: keyof IThemeColors; label: string; hint: string }> = [
  { key: 'baseColor',       label: 'Color principal',       hint: 'Acento y marca del portfolio' },
  { key: 'veryLightGray',   label: 'Fondo claro',           hint: 'Fondos de secciones y tarjetas' },
  { key: 'darkGray',        label: 'Texto oscuro',          hint: 'Títulos y cabeceras principales' },
  { key: 'mediumGray',      label: 'Texto secundario',      hint: 'Párrafos e iconos de apoyo' },
  { key: 'lightMediumGray', label: 'Bordes y divisores',    hint: 'Líneas separadoras y bordes' },
];

@Component({
  selector: 'app-admin-theme-form-page',
  standalone: true,
  imports: [FormsModule, RouterLink, AlertModule, ButtonModule, CardModule, FormModule, SpinnerComponent],
  templateUrl: './theme-form-page.component.html',
  styleUrl: './theme-form-page.component.scss',
})
export class AdminThemeFormPageComponent implements OnInit {
  readonly fontOptions = FONT_OPTIONS;
  readonly colorFields = COLOR_FIELD_META;

  mode: ThemeFormMode = 'create';
  themeId = '';
  loading = false;
  saving = false;
  generatingPalette = false;
  notFound = false;
  error: string | null = null;

  name = '';
  colors: IThemeColors = { ...DEFAULT_THEME_COLORS };

  paletteMode: string = 'analogic-complement';
  readonly paletteModes = [
    { value: 'analogic-complement', label: 'Análogo complementario' },
    { value: 'triad',               label: 'Triádico' },
    { value: 'quad',                label: 'Cuadrado' },
    { value: 'complement',          label: 'Complementario' },
    { value: 'analogic',            label: 'Análogo' },
  ];

  constructor(
    private readonly themeService: ThemeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastr: ToastrService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.mode = (this.route.snapshot.data['mode'] as ThemeFormMode) || 'create';
    if (this.mode === 'edit') {
      this.themeId = this.route.snapshot.paramMap.get('id') || '';
      await this.loadTheme();
    }
  }

  async loadTheme(): Promise<void> {
    this.loading = true;
    try {
      const themes = await this.themeService.listThemes();
      const theme = themes.find((t) => t._id === this.themeId);
      if (!theme) { this.notFound = true; return; }
      this.name = theme.name;
      this.colors = { ...DEFAULT_THEME_COLORS, ...theme.colors };
    } catch {
      this.error = 'No se pudo cargar el tema.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async generatePalette(): Promise<void> {
    const hex = (this.colors.baseColor ?? '').replace('#', '').trim();
    if (!hex || hex.length < 6) {
      this.toastr.warning('Ingresa un color principal válido primero.', 'Paleta');
      return;
    }
    this.generatingPalette = true;
    try {
      const palette = await this.themeService.generatePalette(hex, this.paletteMode);
      this.colors = { ...this.colors, ...palette };
      this.toastr.success('Paleta generada correctamente.', 'Paleta');
    } catch {
      this.toastr.error('No se pudo generar la paleta. Verifica tu conexión.', 'Paleta');
    } finally {
      this.generatingPalette = false;
      this.cdr.detectChanges();
    }
  }

  get pageTitle(): string {
    return this.mode === 'create' ? 'Nuevo tema' : 'Editar tema';
  }

  get kicker(): string {
    return this.mode === 'create' ? 'Creando tema' : 'Editando tema';
  }

  async save(): Promise<void> {
    if (!this.name.trim()) {
      this.toastr.warning('El nombre del tema es obligatorio.', 'Panel');
      return;
    }
    this.saving = true;
    try {
      if (this.mode === 'create') {
        await this.themeService.createTheme({ name: this.name.trim(), colors: { ...this.colors } });
        this.toastr.success('Tema creado.', 'Panel');
      } else {
        await this.themeService.updateTheme(this.themeId, { name: this.name.trim(), colors: { ...this.colors } });
        this.toastr.success('Tema actualizado.', 'Panel');
      }
      await this.router.navigate(['/admin/dashboard/themes']);
    } catch {
      this.toastr.error('No se pudo guardar el tema.', 'Panel');
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/dashboard/themes']);
  }
}
