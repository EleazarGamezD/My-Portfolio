import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { ContentService } from '@core/services/content/content.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { ButtonModule, SpinnerComponent } from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';

interface DangerAction {
  id: string;
  title: string;
  description: string;
  confirmTitle: string;
  confirmBody: string;
  buttonLabel: string;
  isForce?: boolean;
}

@Component({
  selector: 'app-danger-zone-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, SpinnerComponent],
  templateUrl: './danger-zone-page.component.html',
  styleUrl: './danger-zone-page.component.scss',
})
export class DangerZonePageComponent {
  loadingId: string | null = null;

  pendingAction: DangerAction | null = null;

  readonly actions: DangerAction[] = [
    {
      id: 'seed-initial',
      title: 'Seed inicial del sistema',
      description: 'Inserta el contenido inicial del portfolio (perfil, proyectos demo, skills, experiencia, etc.) si la base de datos está vacía.',
      confirmTitle: 'Ejecutar seed inicial',
      confirmBody: 'Se insertará el contenido base del portfolio. Si ya existen datos, la operación se omitirá de manera segura.',
      buttonLabel: 'Ejecutar seed',
    },
    {
      id: 'seed-initial-demo',
      title: 'Seed con contenido demo personal',
      description: 'Inserta un conjunto completo de contenido de demostración (perfil, proyectos, skills, etc.) reemplazando el existente.',
      confirmTitle: 'Seed de contenido demo',
      confirmBody: '<strong>⚠️ Atención:</strong> Esto insertará contenido de demostración. Úsalo solo en entornos de prueba.',
      buttonLabel: 'Seed demo',
      isForce: true,
    },
    {
      id: 'seed-themes',
      title: 'Seed de temas predeterminados',
      description: 'Inserta los 5 temas base si no existen aún. La operación es segura y se omite si ya hay temas.',
      confirmTitle: 'Ejecutar seed de temas',
      confirmBody: 'Se intentará insertar los 5 temas predeterminados. Si ya existen temas, la operación se omitirá.',
      buttonLabel: 'Ejecutar seed',
    },
    {
      id: 'seed-themes-force',
      title: 'Forzar seed de temas',
      description: 'Elimina TODOS los temas actuales y los reemplaza con los 5 predeterminados. Esta acción es irreversible.',
      confirmTitle: 'Forzar seed de temas',
      confirmBody: 'Se eliminarán TODOS los temas actuales y se insertarán los 5 predeterminados. Esta acción no se puede deshacer.',
      buttonLabel: 'Forzar seed',
      isForce: true,
    },
  ];

  constructor(
    private readonly themeService: ThemeService,
    private readonly adminAuthService: AdminAuthService,
    private readonly contentService: ContentService,
    private readonly toastr: ToastrService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  openConfirm(action: DangerAction): void {
    this.pendingAction = action;
    this.cdr.detectChanges();
  }

  closeConfirm(): void {
    this.pendingAction = null;
    this.cdr.detectChanges();
  }

  async confirmAction(): Promise<void> {
    if (!this.pendingAction) return;
    const action = this.pendingAction;
    this.pendingAction = null;
    this.loadingId = action.id;

    try {
      if (action.id === 'seed-themes' || action.id === 'seed-themes-force') {
        const result = await this.themeService.runSeedThemes(action.isForce ?? false);
        if (result.seeded) {
          this.toastr.success(`Seed ejecutado: ${result.count} temas insertados.`, 'Danger Zone');
        } else {
          this.toastr.info('Ya existen temas. Usa "Forzar seed" para reemplazarlos.', 'Danger Zone');
        }
      } else if (action.id === 'seed-initial') {
        await this.adminAuthService.runSeedInitial('starter');
        this.contentService.invalidateAllContentCache();
        this.toastr.success('Seed inicial ejecutado correctamente.', 'Danger Zone');
      } else if (action.id === 'seed-initial-demo') {
        await this.adminAuthService.runSeedInitial('demo-personal');
        this.contentService.invalidateAllContentCache();
        this.toastr.success('Seed de contenido demo ejecutado correctamente.', 'Danger Zone');
      }
    } catch {
      this.toastr.error('Error al ejecutar la acción.', 'Danger Zone');
    } finally {
      this.loadingId = null;
      this.cdr.detectChanges();
    }
  }
}
