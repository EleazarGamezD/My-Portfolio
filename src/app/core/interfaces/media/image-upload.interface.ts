import { ICompressedImage } from '@core/utils/image-compression.util';

export interface IImageUploadResult {
  success: boolean;
  data?: ICompressedImage;
  error?: string;
}
