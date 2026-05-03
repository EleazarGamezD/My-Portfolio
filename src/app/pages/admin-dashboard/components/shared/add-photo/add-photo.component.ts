import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import { IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { convertToWebP } from '@core/utils/webp/webp.utils';
import { IconDirective } from '@coreui/icons-angular';
import { StorageService } from '@services/storage/storage.service';
import imageCompression from 'browser-image-compression';
import { ToastrService } from 'ngx-toastr';

export type StoredImage = { id?: string; file: string; extension?: string };
export type LocalImage = {
  id: string;
  file?: File;
  objectURL: string;
  isVideo: boolean;
  base64?: string;
  extension?: string;
};

@Component({
  selector: 'app-add-photo',
  standalone: true,
  imports: [CommonModule, IconDirective],
  templateUrl: './add-photo.component.html',
  styleUrls: ['./add-photo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPhotoComponent implements OnInit, OnChanges {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() assetsChange = new EventEmitter<IProjectAsset[]>();
  @Output() uploadError = new EventEmitter<string>();

  // Inputs
  storageKey = input<string>('images');
  persistDraft = input<boolean>(true);
  maxPhotos = input<number>(4);
  maxMb = input<number>(5);
  hint = input<string>('Arrastra o haz click');
  label = input<string>('Agregar foto');
  title = input<string>('Galería de Fotos');
  subTitle = input<string>('En caso aplique, añade fotografías');
  urlsPreviews = input<string[]>([]);

  // Data
  images: LocalImage[] = [];
  maxSizeBytes: number = this.maxMb() * 1024 * 1024;
  isDragOver: boolean = false;
  maxSizeMb: number = this.maxMb();
  nextId = 1;
  previewUrls: string[] = this.urlsPreviews();

  // Dependencies
  _storage = inject(StorageService);
  _toast = inject(ToastrService);
  _cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    await this.syncImages();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (
      changes['urlsPreviews']?.firstChange &&
      changes['storageKey']?.firstChange &&
      changes['persistDraft']?.firstChange
    ) {
      return;
    }

    this.previewUrls = this.urlsPreviews();
    await this.syncImages();
  }

  async onFileSelect(
    event: File[] | { files?: File[] } | { originalEvent?: Event } | Event,
  ): Promise<void> {
    const files: File[] = Array.isArray(event) ? event : this.extractFiles(event);
    if (!files.length) {
      this.isDragOver = false;
      this._cdr.markForCheck();
      return;
    }

    this.isDragOver = false;
    this._cdr.markForCheck();

    // Asegurar que el siguiente id sea secuencial basado en el estado actual
    this.nextId = this.images.length + 1;

    for (const file of files) {
      if (this.images.length >= this.maxPhotos()) {
        if (this.maxPhotos() === 1) {
          this.clearLocalImages();
        } else {
          this.showToast('warning', 'Máximo de fotos alcanzado');
          break;
        }
      }

      if (file.size > this.maxSizeBytes) {
        this.showToast('warning', `${file.name} supera ${this.maxSizeMb}Mb.`);
        continue;
      }

      const isVideo = file.type.startsWith('video/');
      const id = (this.nextId++).toString();
      const objectURL = URL.createObjectURL(file);

      if (isVideo) {
        this.images.push({ id, file, objectURL, isVideo });
        continue;
      }

      try {
        this.images.push({ id, file, objectURL, isVideo });
        this._cdr.markForCheck();

        const { base64DataUrl, base64Raw } = await this.compressAndConvert(file);
        const imgIndex = this.images.findIndex((img) => img.id === id);
        if (imgIndex !== -1) {
          URL.revokeObjectURL(this.images[imgIndex].objectURL);
          this.images[imgIndex] = {
            id,
            file,
            objectURL: base64DataUrl,
            isVideo,
            base64: base64Raw,
            extension: 'webp',
          };
        }
      } catch (error) {
        console.error(error);
        this.showToast('error', 'No se pudo procesar la imagen.');
        this.uploadError.emit('No se pudo procesar la imagen.');
      }
    }

    await this.updateStorage();
    this.isDragOver = this.images.length === 0;
    this._cdr.markForCheck();
  }

  async loadImagesFromStorage(): Promise<void> {
    const stored = await this._storage.getStorage(this.storageKey());
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.images = [];
      this.isDragOver = false;
      this._cdr.markForCheck();
      return;
    }

    this.images = stored.slice(0, this.maxPhotos()).map((item: StoredImage, index: number) => {
      const dataUrl = `data:image/${item.extension || 'webp'};base64,${item.file}`;
      return {
        id: (index + 1).toString(),
        objectURL: dataUrl,
        isVideo: false,
        base64: item.file,
        extension: item.extension || 'webp',
      };
    });

    this.nextId = this.images.length + 1;
    this.isDragOver = false;
    this._cdr.markForCheck();
  }

  private async loadImagesFromPreviewUrls(urls: string[]): Promise<void> {
    this.clearLocalImages();

    for (const url of urls) {
      if (this.images.length >= this.maxPhotos()) {
        break;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error fetching preview ${url}`);

        const blob = await response.blob();
        const isVideo = blob.type.startsWith('video/');
        const id = (this.nextId++).toString();
        const file = new File([blob], `preview-${id}`, { type: blob.type || 'image/*' });
        const objectURL = URL.createObjectURL(blob);

        this.images.push({ id, file, objectURL, isVideo });
        this._cdr.markForCheck();

        if (isVideo) continue;

        const { base64DataUrl, base64Raw } = await this.compressAndConvert(file);
        const imgIndex = this.images.findIndex((img) => img.id === id);
        if (imgIndex !== -1) {
          URL.revokeObjectURL(this.images[imgIndex].objectURL);
          this.images[imgIndex] = {
            id,
            file,
            objectURL: base64DataUrl,
            isVideo,
            base64: base64Raw,
            extension: 'webp',
          };
        }
      } catch (error) {
        console.error(error);
        this.showToast('warning', 'No se pudo cargar una imagen previa.');
        this.uploadError.emit('No se pudo cargar una imagen previa.');
      }
    }

    await this.updateStorage();
    this.isDragOver = false;
    this._cdr.markForCheck();
  }

  trackByImage(_: number, item: { id: string }) {
    return item.id;
  }

  removeImage(index: number) {
    const img = this.images[index];
    if (img) {
      URL.revokeObjectURL(img.objectURL);
      this.images.splice(index, 1);
      void this.updateStorage();
      this.isDragOver = false;
      this._cdr.markForCheck();
    }
  }

  clearAll() {
    this.clearLocalImages();
    void this.clearDraftStorage();
    this.emitAssetsChange();
    this.isDragOver = false;
    this._cdr.markForCheck();
  }

  async updateStorage() {
    const gallery = this.images
      .filter((img) => !img.isVideo && img.base64)
      .map((img, index) => ({
        id: (index + 1).toString(),
        file: img.base64 as string,
        extension: img.extension || 'webp',
      }));

    try {
      if (this.persistDraft()) {
        await this._storage.setStorage(this.storageKey(), gallery);
      }
      this.emitAssetsChange();
    } catch (error) {
      console.error('Error saving gallery to storage:', error);
      this.showToast('error', 'Error al guardar la galería');
      this.uploadError.emit('Error al guardar la galería');
    }
  }

  async fileToBase64(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private async compressAndConvert(
    file: File,
  ): Promise<{ base64DataUrl: string; base64Raw: string }> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const compressed = await imageCompression(file, options);
    const dataUrl = await this.fileToBase64(compressed);
    const webpDataUrl = await convertToWebP(dataUrl);
    const base64Raw = webpDataUrl.split(',')[1] || '';
    return { base64DataUrl: webpDataUrl, base64Raw };
  }

  extractFiles(event: { files?: File[] } | { originalEvent?: Event } | Event): File[] {
    if ('files' in event && Array.isArray(event.files)) return event.files;
    if (event instanceof DragEvent && event.dataTransfer?.files?.length) {
      return Array.from(event.dataTransfer.files);
    }
    if (event instanceof Event) {
      const input = event.target as HTMLInputElement | null;
      if (input?.files) return Array.from(input.files);
    }
    if ('originalEvent' in event && event.originalEvent instanceof Event) {
      const input = event.originalEvent.target as HTMLInputElement | null;
      if (input?.files) return Array.from(input.files);
    }
    return [];
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
    this._cdr.markForCheck();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    this._cdr.markForCheck();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    this.onFileSelect(event);
    this._cdr.markForCheck();
  }

  private emitAssetsChange(): void {
    const assets = this.images
      .filter((img) => !img.isVideo && img.base64)
      .map((img, index) => ({
        id: img.id || String(index + 1),
        file: img.base64 as string,
        extension: img.extension || 'webp',
      } satisfies IProjectAsset));

    this.assetsChange.emit(assets);
  }

  private showToast(type: 'error' | 'warning', message: string): void {
    this._toast[type](message, 'Dashboard', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
    });
  }

  private async syncImages(): Promise<void> {
    this.previewUrls = this.urlsPreviews().slice(0, this.maxPhotos());

    if (this.previewUrls.length > 0) {
      await this.clearDraftStorage();
      await this.loadImagesFromPreviewUrls(this.previewUrls);
      return;
    }

    if (this.persistDraft()) {
      await this.loadImagesFromStorage();
    } else {
      this.clearLocalImages();
      this.emitAssetsChange();
      this._cdr.markForCheck();
    }
  }

  private clearLocalImages(): void {
    this.images.forEach((img) => URL.revokeObjectURL(img.objectURL));
    this.images = [];
    this.nextId = 1;
  }

  private async clearDraftStorage(): Promise<void> {
    if (this.persistDraft()) {
      await this._storage.deleteStorage(this.storageKey());
    }
  }
}
