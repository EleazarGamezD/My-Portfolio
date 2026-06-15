import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IApiResume } from '@core/interfaces/content/content.interface';
import { API_CONTENT_ROUTES } from '@core/routes/content/content.routes';
import { AdminAuthService } from '@core/services/admin-auth/admin-auth.service';
import { ContentService } from '@core/services/content/content.service';
import {
  AlertModule,
  BadgeModule,
  ButtonModule,
  CardModule,
  FormModule,
  SpinnerModule,
} from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';

type ResumeLanguage = 'es' | 'en';

interface ResumeSlotDraft {
  language: ResumeLanguage;
  heading: string;
  title: string;
  description: string;
  order: number;
  itemId: string | null;
  fileName: string;
  mimeType: string;
  base64: string;
  downloadUrl: string;
  metadata: Record<string, unknown>;
}

@Component({
  selector: 'app-admin-resumes-page',
  standalone: true,
  imports: [
    FormsModule,
    AlertModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    FormModule,
    SpinnerModule
],
  templateUrl: './resumes-page.component.html',
  styleUrl: './resumes-page.component.scss',
})
export class AdminResumesPageComponent implements OnInit {
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;
  savingLanguage: ResumeLanguage | null = null;

  readonly slots: ResumeSlotDraft[] = [
    this.createEmptySlot('es', 'CV Español', 1),
    this.createEmptySlot('en', 'CV Inglés', 2),
  ];

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly contentService: ContentService,
    private readonly toastr: ToastrService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadResumes();
  }

  async loadResumes(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      await this.adminAuthService.getCurrentAdmin();
      const resumes = await this.contentService.getResumes();
      this.hydrateSlots(resumes);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'No se pudieron cargar las hojas de vida.';
      this.showErrorToast(this.error, 'Hojas de vida');
      this.resetSlots();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async saveSlot(slot: ResumeSlotDraft): Promise<void> {
    if (!slot.title.trim()) {
      this.error = `El nombre visible del ${slot.heading.toLowerCase()} es obligatorio.`;
      this.showErrorToast(this.error, 'Hojas de vida');
      return;
    }

    if (!slot.base64.trim() && !slot.downloadUrl.trim() && !slot.fileName.trim()) {
      this.error = `Debes cargar un archivo para ${slot.heading.toLowerCase()}.`;
      this.showErrorToast(this.error, 'Hojas de vida');
      return;
    }

    try {
      this.savingLanguage = slot.language;
      this.error = null;
      this.successMessage = null;

      const payload: Partial<IApiResume> = {
        label: { es: slot.title.trim(), en: slot.title.trim() },
        title: { es: slot.title.trim(), en: slot.title.trim() },
        description: {
          es: slot.description.trim(),
          en: slot.description.trim(),
        },
        active: true,
        fileName: slot.fileName,
        mimeType: slot.mimeType || 'application/pdf',
        base64: slot.base64.trim() || undefined,
        metadata: {
          ...slot.metadata,
          language: slot.language,
        },
        order: slot.order,
      };

      if (slot.itemId) {
        await this.contentService.updateContentItem('resumes', slot.itemId, payload);
      } else {
        await this.contentService.createContentItem('resumes', payload);
      }

      this.successMessage = `${slot.heading} actualizado correctamente.`;
      this.showSuccessToast(this.successMessage, 'Hojas de vida');
      await this.loadResumes();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'No se pudo guardar la hoja de vida.';
      this.showErrorToast(this.error, 'Hojas de vida');
    } finally {
      this.savingLanguage = null;
      this.cdr.detectChanges();
    }
  }

  async onFileSelected(slot: ResumeSlotDraft, event: Event): Promise<void> {
    const file = this.getSelectedFile(event);
    if (!file) {
      return;
    }

    try {
      const fileData = await this.readFileAsDataUrl(file);
      slot.fileName = file.name;
      slot.mimeType = file.type || this.inferMimeTypeFromFileName(file.name);
      slot.base64 = fileData;
      this.error = null;
      this.cdr.detectChanges();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'No se pudo leer el archivo seleccionado.';
      this.showErrorToast(this.error, 'Hojas de vida');
    }
  }

  isSaving(slot: ResumeSlotDraft): boolean {
    return this.savingLanguage === slot.language;
  }

  hasResume(slot: ResumeSlotDraft): boolean {
    return Boolean(slot.itemId);
  }

  getCurrentFileLabel(slot: ResumeSlotDraft): string {
    return slot.fileName || 'Aun no se ha cargado un archivo.';
  }

  private hydrateSlots(resumes: IApiResume[]): void {
    this.resetSlots();

    for (const item of resumes) {
      const language = this.resolveResumeLanguage(item);
      const slot = this.slots.find((candidate) => candidate.language === language);

      if (!slot) {
        continue;
      }

      slot.itemId = item._id || null;
      slot.title = this.readLocalizedValue(item.label, language) || this.readLocalizedValue(item.title, language);
      slot.description = this.readLocalizedValue(item.description, language);
      slot.fileName = item.fileName || '';
      slot.mimeType = item.mimeType || 'application/pdf';
      slot.base64 = item.base64 || '';
      slot.downloadUrl = item.href || '';
      slot.order = typeof item.order === 'number' ? item.order : slot.order;
      slot.metadata = typeof item.metadata === 'object' && item.metadata !== null ? item.metadata : {};
    }
  }

  private resetSlots(): void {
    this.slots.splice(
      0,
      this.slots.length,
      this.createEmptySlot('es', 'CV Español', 1),
      this.createEmptySlot('en', 'CV Inglés', 2),
    );
  }

  private createEmptySlot(language: ResumeLanguage, heading: string, order: number): ResumeSlotDraft {
    return {
      language,
      heading,
      title: '',
      description: '',
      order,
      itemId: null,
      fileName: '',
      mimeType: 'application/pdf',
      base64: '',
      downloadUrl: '',
      metadata: { language },
    };
  }

  private resolveResumeLanguage(item: IApiResume): ResumeLanguage {
    const metadataLanguage = typeof item.metadata?.['language'] === 'string' ? item.metadata['language'] : '';
    const normalizedLanguage = metadataLanguage.toLowerCase();

    if (normalizedLanguage === 'en') {
      return 'en';
    }

    if (normalizedLanguage === 'es') {
      return 'es';
    }

    const resumeIdentity = `${item.slug || ''} ${item.fileName || ''}`.toLowerCase();
    return resumeIdentity.includes('en') ? 'en' : 'es';
  }

  private readLocalizedValue(
    value: IApiResume['label'] | IApiResume['title'] | IApiResume['description'],
    language: ResumeLanguage,
  ): string {
    if (!value) {
      return '';
    }

    return value[language]?.trim() || value.es?.trim() || value.en?.trim() || '';
  }

  private getSelectedFile(event: Event): File | null {
    const input = event.target as HTMLInputElement | null;
    return input?.files?.[0] ?? null;
  }

  private inferMimeTypeFromFileName(fileName: string): string {
    const normalized = fileName.toLowerCase();

    if (normalized.endsWith('.pdf')) {
      return 'application/pdf';
    }

    if (normalized.endsWith('.docx')) {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    if (normalized.endsWith('.doc')) {
      return 'application/msword';
    }

    return 'application/octet-stream';
  }

  private async readFileAsDataUrl(file: File): Promise<string> {
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error('El archivo excede el limite de 5MB.');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.readAsDataURL(file);
    });
  }

  private showSuccessToast(message: string, title: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.toastr.success(message, title, { timeOut: 2500 });
  }

  private showErrorToast(message: string, title: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.toastr.error(message, title, { timeOut: 3500 });
  }

  downloadGeneratedPdf(lang: ResumeLanguage): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const url = API_CONTENT_ROUTES.generateCvPdf(lang);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = lang === 'es' ? 'cv-es.pdf' : 'resume-en.pdf';
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
