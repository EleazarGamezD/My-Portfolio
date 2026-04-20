import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule, FormModule } from '@coreui/angular';
import { IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import {
  base64AssetToStoredImage,
  createBase64ImageAsset,
  resolveImageAssetUrl,
} from '@core/utils/image/admin-image.utils';

@Component({
  selector: 'app-admin-image-uploader',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormModule],
  templateUrl: './admin-image-uploader.component.html',
  styleUrl: './admin-image-uploader.component.scss',
})
export class AdminImageUploaderComponent {
  @Input() assets: IProjectAsset[] = [];
  @Input() multiple = false;
  @Input() maxItems = 1;
  @Input() title = 'Images';
  @Input() hint = 'Drag images here or select files.';
  @Input() buttonLabel = 'Select image';
  @Input() emptyLabel = 'No images selected yet.';
  @Output() assetsChange = new EventEmitter<IProjectAsset[]>();
  @Output() uploadError = new EventEmitter<string>();

  isDragOver = false;

  get canAddMore(): boolean {
    return this.assets.length < this.maxItems;
  }

  async onFileSelection(event: Event | DragEvent): Promise<void> {
    const files = this.extractFiles(event);
    if (!files.length) {
      this.isDragOver = false;
      return;
    }

    try {
      const remainingSlots = this.multiple ? Math.max(this.maxItems - this.assets.length, 0) : 1;
      const selectedFiles = files.filter((file) => file.type.startsWith('image/')).slice(0, remainingSlots);

      if (!selectedFiles.length) {
        this.uploadError.emit('Only image files are allowed.');
        return;
      }

      const nextAssets = this.multiple ? [...this.assets] : [];
      const normalizedAssets = await Promise.all(
        selectedFiles.map(async (file) => {
          const asset = await createBase64ImageAsset(file);
          return base64AssetToStoredImage(asset) as IProjectAsset;
        }),
      );

      this.assetsChange.emit([...nextAssets, ...normalizedAssets].slice(0, this.maxItems));
    } catch (error) {
      this.uploadError.emit(error instanceof Error ? error.message : 'Failed to process image files.');
    } finally {
      this.isDragOver = false;
      const input = event.target as HTMLInputElement | null;
      if (input) {
        input.value = '';
      }
    }
  }

  removeAsset(index: number): void {
    this.assetsChange.emit(this.assets.filter((_, itemIndex) => itemIndex !== index));
  }

  previewFor(asset: IProjectAsset): string | null {
    return resolveImageAssetUrl(asset);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.onFileSelection(event);
  }

  private extractFiles(event: Event | DragEvent): File[] {
    if (event instanceof DragEvent) {
      return Array.from(event.dataTransfer?.files ?? []);
    }

    const input = event.target as HTMLInputElement | null;
    return Array.from(input?.files ?? []);
  }
}
