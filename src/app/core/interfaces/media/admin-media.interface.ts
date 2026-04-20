export interface IStoredImageAsset {
  id?: string;
  file: string;
  extension?: string;
  mimeType?: string;
  fileName?: string;
}

export interface IBase64ImageAsset {
  base64: string;
  mimeType: string;
  fileName: string;
  extension?: string;
  previewUrl?: string;
  size?: number;
}

export interface IImageCompressionOptions {
  maxSizeMb?: number;
  maxWidthOrHeight?: number;
  fileType?: string;
  initialQuality?: number;
}
