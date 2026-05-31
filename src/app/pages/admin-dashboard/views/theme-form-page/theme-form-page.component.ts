import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DEFAULT_THEME_COLORS, FONT_OPTIONS, IThemeColors } from '@core/interfaces/theme/theme.interface';
import { ThemeService } from '@core/services/theme/theme.service';
import { AlertModule, ButtonModule, CardModule, FormModule, SpinnerComponent } from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

type ThemeFormMode = 'create' | 'edit';

export const COLOR_FIELD_META: Array<{ key: keyof IThemeColors; label: string; hint: string }> = [
  { key: 'baseColor',       label: 'Color principal',       hint: 'Acento y marca del portfolio' },
  { key: 'veryLightGray',   label: 'Fondo claro',           hint: 'Fondos de secciones y tarjetas' },
  { key: 'darkGray',        label: 'Texto oscuro',          hint: 'Títulos y cabeceras principales' },
  { key: 'mediumGray',      label: 'Texto secundario',      hint: 'Párrafos e iconos de apoyo' },
  { key: 'lightMediumGray', label: 'Bordes y divisores',    hint: 'Líneas separadoras y bordes' },
];

interface ColorApiScheme {
  colors: Array<{ hex: { value: string } }>;
}

@Component({
  selector: 'app-admin-theme-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AlertModule, ButtonModule, CardModule, FormModule, SpinnerComponent],
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

  paletteMode: 'analogic-complement' | 'triad' | 'quad' | 'complement' | 'analogic' = 'analogic-complement';
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
    private readonly http: HttpClient,
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
    const hex = (this.colors.baseColor ?? '').replace('#', '');
    if (!hex || hex.length < 6) {
      this.toastr.warning('Ingresa un color principal válido primero.', 'Paleta');
      return;
    }
    this.generatingPalette = true;
    try {
      const url = `https://www.thecolorapi.com/scheme?hex=${hex}&mode=${this.paletteMode}&count=5`;
      const result = await firstValueFrom(this.http.get<ColorApiScheme>(url));
      const palette = (result.colors ?? []).map((c) => c.hex?.value ?? '#cccccc');
      if (palette.length >= 5) {
        // Map generated palette to semantic slots
        // [0] = base (keep user's choice), [1..4] = supporting palette
        this.colors = {
          ...this.colors,
          baseColor:       palette[0] ?? this.colors.baseColor,
          veryLightGray:   this.lightenToBackground(palette[1] ?? '#ecf0f1'),
          darkGray:        this.darkenForText(palette[2] ?? '#2e4052'),
          mediumGray:      palette[3] ?? '#7f8c8d',
          lightMediumGray: this.desaturateForBorder(palette[4] ?? '#bdc3c7'),
        };
        this.toastr.success('Paleta generada correctamente.', 'Paleta');
      }
    } catch {
      this.toastr.error('No se pudo generar la paleta. Verifica tu conexión.', 'Paleta');
    } finally {
      this.generatingPalette = false;
      this.cdr.detectChanges();
    }
  }

  /** Ensures a background color is light enough (raises lightness to ≥ 88%) */
  private lightenToBackground(hex: string): string {
    const [h, s, l] = this.hexToHsl(hex);
    return this.hslToHex(h, Math.min(s, 20), Math.max(l, 88));
  }

  /** Ensures a text color is dark enough (lowers lightness to ≤ 30%) */
  private darkenForText(hex: string): string {
    const [h, s, l] = this.hexToHsl(hex);
    return this.hslToHex(h, Math.max(s, 20), Math.min(l, 28));
  }

  /** Desaturates a color for border use */
  private desaturateForBorder(hex: string): string {
    const [h, s, l] = this.hexToHsl(hex);
    return this.hslToHex(h, Math.min(s, 15), Math.min(Math.max(l, 72), 82));
  }

  private hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  private hslToHex(h: number, s: number, l: number): string {
    const hN = h / 360, sN = s / 100, lN = l / 100;
    const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
    const p = 2 * lN - q;
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const r = Math.round(hue2rgb(hN + 1/3) * 255);
    const g = Math.round(hue2rgb(hN) * 255);
    const b = Math.round(hue2rgb(hN - 1/3) * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
