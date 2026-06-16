import { IProjectAsset } from '@core/interfaces/projects/projects.interfaces';

export type PhotoEditorVariant = 'single' | 'gallery';

export type PhotoEditorAction = 'add' | 'replace';

export type ProjectAssetReference = string | IProjectAsset;

export interface EditablePhotoItem {
  id: string;
  previewUrl: string;
  asset: IProjectAsset;
}
