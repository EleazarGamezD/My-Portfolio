export interface IStoredImageAsset {
  id?: string;
  name?: string;
  file: string;
  extension?: string;
  fileName?: string;
}

export interface IBase64ImageAsset {
  id?: string;
  name?: string;
  base64: string;
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
