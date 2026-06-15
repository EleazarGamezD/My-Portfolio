import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import { IBase64ImageAsset } from '@core/interfaces/media/admin-media.interface';
import { IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import {
  createBase64ImageAsset,
  resolveImageAssetUrl,
} from '@core/utils/image/admin-image.utils';
import { ToastrService } from 'ngx-toastr';

type PhotoEditorVariant = 'single' | 'gallery';
type PhotoEditorAction = 'add' | 'replace';
type ProjectAssetReference = string | IProjectAsset;

interface EditablePhotoItem {
  id: string;
  previewUrl: string;
  asset: IProjectAsset;
}

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-editor.component.html',
  styleUrl: './photo-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoEditorComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() assetsChange = new EventEmitter<IProjectAsset[]>();
  @Output() uploadError = new EventEmitter<string>();

  assets = input<ProjectAssetReference[]>([]);
  title = input<string>('Photos');
  subTitle = input<string>('Administra las imagenes actuales');
  emptyLabel = input<string>('Agregar imagen');
  addButtonLabel = input<string>('Agregar');
  changeButtonLabel = input<string>('Cambiar');
  removeButtonLabel = input<string>('Eliminar');
  variant = input<PhotoEditorVariant>('single');
  maxPhotos = input<number>(1);
  maxMb = input<number>(5);

  items: EditablePhotoItem[] = [];
  selectedIndex = 0;
  pendingAction: PhotoEditorAction = 'add';
  pendingTargetIndex: number | null = null;

  private readonly toast = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);
  private initialized = false;
  private lastAssetSignature = '';

  ngOnInit(): void {
    this.syncFromAssets();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.initialized && changes['assets']?.firstChange) {
      return;
    }

    this.syncFromAssets();
  }

  ngOnDestroy(): void {
    this.resetPendingAction();
  }

  get hasItems(): boolean {
    return this.items.length > 0;
  }

  get selectedItem(): EditablePhotoItem | null {
    return this.items[this.selectedIndex] ?? null;
  }

  get canAddMore(): boolean {
    return this.items.length < this.maxPhotos();
  }

  get isGalleryVariant(): boolean {
    return this.variant() === 'gallery';
  }

  get allowMultipleSelection(): boolean {
    return this.pendingAction === 'add' && this.isGalleryVariant && this.maxPhotos() > 1;
  }

  selectItem(index: number): void {
    if (!this.items[index]) {
      return;
    }

    this.selectedIndex = index;
    this.cdr.markForCheck();
  }

  openAddDialog(): void {
    if (!this.canAddMore) {
      this.showToast('warning', `Máximo de ${this.maxPhotos()} imágenes alcanzado.`);
      return;
    }

    this.pendingAction = 'add';
    this.pendingTargetIndex = null;
    this.openFileDialog();
  }

  openReplaceDialog(index?: number): void {
    const targetIndex = index ?? this.selectedIndex;
    if (!this.items[targetIndex]) {
      return;
    }

    this.pendingAction = 'replace';
    this.pendingTargetIndex = targetIndex;
    this.openFileDialog();
  }

  removeSelected(index?: number): void {
    const targetIndex = index ?? this.selectedIndex;
    if (!this.items[targetIndex]) {
      return;
    }

    this.items.splice(targetIndex, 1);

    if (this.selectedIndex >= this.items.length) {
      this.selectedIndex = Math.max(this.items.length - 1, 0);
    }

    this.emitAssets();
    this.cdr.markForCheck();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const selectedFiles = input?.files ? Array.from(input.files) : [];

    if (!selectedFiles.length) {
      this.resetPendingAction();
      return;
    }

    try {
      if (this.pendingAction === 'replace' && this.pendingTargetIndex !== null) {
        const replacement = await this.createEditableItem(selectedFiles[0]);
        this.zone.run(() => {
          this.items[this.pendingTargetIndex!] = replacement;
          this.selectedIndex = this.pendingTargetIndex!;
          this.emitAssets();
        });
      } else {
        const availableSlots = this.maxPhotos() - this.items.length;
        const filesToAdd = selectedFiles.slice(0, Math.max(availableSlots, 0));

        const newItems: EditablePhotoItem[] = [];
        for (const file of filesToAdd) {
          const item = await this.createEditableItem(file);
          newItems.push(item);
        }

        if (selectedFiles.length > filesToAdd.length) {
          this.showToast('warning', `Sólo se agregaron ${filesToAdd.length} imágenes.`);
        }

        this.zone.run(() => {
          this.items.push(...newItems);
          this.selectedIndex = Math.max(this.items.length - 1, 0);
          this.emitAssets();
        });
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'No se pudo procesar la imagen.';
      this.showToast('error', message);
      this.uploadError.emit(message);
    } finally {
      this.resetPendingAction();
      this.cdr.markForCheck();
    }
  }

  trackByItem(_: number, item: EditablePhotoItem): string {
    return item.id;
  }

  private syncFromAssets(): void {
    const incomingAssets = this.assets();
    const signature = JSON.stringify(incomingAssets);

    if (signature === this.lastAssetSignature) {
      this.initialized = true;
      return;
    }

    this.items = incomingAssets
      .map((asset, index) => this.mapAssetToEditableItem(asset, index))
      .filter((item): item is EditablePhotoItem => item !== null);

    this.selectedIndex = this.items.length ? Math.min(this.selectedIndex, this.items.length - 1) : 0;
    this.lastAssetSignature = signature;
    this.initialized = true;
    this.cdr.markForCheck();
  }

  private mapAssetToEditableItem(
    asset: ProjectAssetReference,
    index: number,
  ): EditablePhotoItem | null {
    const previewUrl = resolveImageAssetUrl(asset);
    if (!previewUrl) {
      return null;
    }

    const id = typeof asset === 'string' ? `existing-${index}` : asset.id || asset.fileName || `existing-${index}`;

    return {
      id,
      previewUrl,
      asset: typeof asset === 'string' ? { url: asset } : asset,
    };
  }

  private async createEditableItem(file: File): Promise<EditablePhotoItem> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Sólo se permiten archivos de imagen.');
    }

    const maxSizeBytes = this.maxMb() * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`${file.name} supera ${this.maxMb()}MB.`);
    }

    const asset = await createBase64ImageAsset(file, { maxSizeMb: this.maxMb() });
    return this.base64AssetToEditableItem(asset);
  }

  private base64AssetToEditableItem(asset: IBase64ImageAsset): EditablePhotoItem {
    return {
      id: asset.id || crypto.randomUUID(),
      previewUrl: asset.previewUrl || resolveImageAssetUrl({ file: asset.base64, extension: asset.extension }) || '',
      asset: {
        id: asset.id,
        name: asset.name,
        file: asset.base64,
        extension: asset.extension,
      },
    };
  }

  private emitAssets(): void {
    this.assetsChange.emit(this.items.map((item) => item.asset));
  }

  private openFileDialog(): void {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  private resetPendingAction(): void {
    this.pendingAction = 'add';
    this.pendingTargetIndex = null;

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private showToast(type: 'error' | 'warning', message: string): void {
    this.toast[type](message, 'Panel', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
    });
  }
}
