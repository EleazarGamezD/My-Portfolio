import imageCompression from 'browser-image-compression';
import {
  IBase64ImageAsset,
  IImageCompressionOptions,
  IStoredImageAsset,
} from '@core/interfaces/media/admin-media.interface';

type ResolvableImageAsset =
  | string
  | {
      url?: string;
      file?: string;
      base64?: string;
      extension?: string;
    }
  | null
  | undefined;

const DEFAULT_IMAGE_OPTIONS: Required<IImageCompressionOptions> = {
  maxSizeMb: 2,
  maxWidthOrHeight: 1920,
  fileType: 'image/webp',
  initialQuality: 0.8,
};

export async function createBase64ImageAsset(
  file: File,
  options: IImageCompressionOptions = {},
): Promise<IBase64ImageAsset> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be converted to base64 assets.');
  }

  const settings = { ...DEFAULT_IMAGE_OPTIONS, ...options };
  const compressedFile = await imageCompression(file, {
    maxSizeMB: settings.maxSizeMb,
    maxWidthOrHeight: settings.maxWidthOrHeight,
    useWebWorker: true,
    fileType: settings.fileType,
    initialQuality: settings.initialQuality,
  });

  const previewUrl = await readFileAsDataUrl(compressedFile);
  const extension = getExtension(compressedFile.type, compressedFile.name);

  return {
    id: crypto.randomUUID(),
    name: compressedFile.name,
    base64: stripDataUrlPrefix(previewUrl),
    fileName: withExtension(compressedFile.name, extension),
    extension,
    previewUrl,
    size: compressedFile.size,
  };
}

export function storedImageAssetToDataUrl(asset: IStoredImageAsset): string {
  const mimeType = `image/${asset.extension || 'webp'}`;
  return `data:${mimeType};base64,${asset.file}`;
}

export function base64AssetToStoredImage(asset: IBase64ImageAsset): IStoredImageAsset {
  return {
    id: asset.id,
    name: asset.name,
    file: asset.base64,
    extension: asset.extension,
    fileName: asset.fileName,
  };
}

export function resolveImageAssetUrl(asset: ResolvableImageAsset): string | null {
  if (!asset) {
    return null;
  }

  if (typeof asset === 'string') {
    return asset;
  }

  if (asset.url) {
    return asset.url;
  }

  const rawFile = asset.file || asset.base64;
  if (!rawFile) {
    return null;
  }

  if (rawFile.startsWith('data:')) {
    return rawFile;
  }

  const mimeType = `image/${asset.extension || 'webp'}`;
  return `data:${mimeType};base64,${rawFile}`;
}

function stripDataUrlPrefix(dataUrl: string): string {
  return dataUrl.split(',')[1] || '';
}

function getExtension(mimeType: string, fileName: string): string {
  const derivedFromMime = mimeType.split('/')[1];
  if (derivedFromMime) {
    return derivedFromMime;
  }

  const fileParts = fileName.split('.');
  return fileParts.length > 1 ? fileParts[fileParts.length - 1] : 'webp';
}

function withExtension(fileName: string, extension: string): string {
  const sanitizedExtension = extension.replace(/^\./, '');
  const baseName = fileName.replace(/\.[^.]+$/, '');
  return `${baseName}.${sanitizedExtension}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
