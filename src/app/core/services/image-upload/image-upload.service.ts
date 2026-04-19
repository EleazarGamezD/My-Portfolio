import { Injectable } from '@angular/core';
import {
    compressImage,
    getBestImageFormat,
    ICompressedImage,
    IImageCompressionOptions,
    isValidImageFile,
} from '@core/utils/image-compression.util';

export interface IImageUploadResult {
    success: boolean;
    data?: ICompressedImage;
    error?: string;
}

@Injectable({
    providedIn: 'root',
})
export class ImageUploadService {
    async uploadAndCompressImage(
        file: File,
        options?: IImageCompressionOptions
    ): Promise<IImageUploadResult> {
        try {
            // Validate file
            if (!isValidImageFile(file)) {
                return {
                    success: false,
                    error: 'Invalid image file. Supported formats: JPEG, PNG, WebP, GIF',
                };
            }

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                return {
                    success: false,
                    error: 'File size exceeds 10MB limit',
                };
            }

            // Get best format if not specified
            const format = options?.format || (await getBestImageFormat());

            // Compress image
            const compressed = await compressImage(file, {
                ...options,
                format,
            });

            return {
                success: true,
                data: compressed,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async uploadMultipleImages(
        files: File[],
        options?: IImageCompressionOptions
    ): Promise<IImageUploadResult[]> {
        return Promise.all(
            files.map((file) => this.uploadAndCompressImage(file, options))
        );
    }
}
