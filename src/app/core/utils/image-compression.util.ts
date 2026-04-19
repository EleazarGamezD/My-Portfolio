/**
 * Image compression and encoding utility for WebP format with base64 fallback
 */

export interface IImageCompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0-1
    format?: 'webp' | 'jpeg' | 'png';
}

export interface ICompressedImage {
    base64: string;
    mimeType: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    format: string;
}

/**
 * Compresses an image file and converts it to base64 format
 * @param file The image file to compress
 * @param options Compression options
 * @returns Promise with compressed image data and metadata
 */
export async function compressImage(
    file: File,
    options: IImageCompressionOptions = {}
): Promise<ICompressedImage> {
    return new Promise((resolve, reject) => {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 0.8,
            format = 'webp',
        } = options;

        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Calculate new dimensions maintaining aspect ratio
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to base64 with appropriate format
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to create blob'));
                            return;
                        }

                        const reader2 = new FileReader();
                        reader2.onload = (e2) => {
                            const base64String = (e2.target?.result as string) || '';
                            const originalSize = file.size;
                            const compressedSize = base64String.length;
                            const compressionRatio =
                                ((originalSize - compressedSize) / originalSize) * 100;

                            resolve({
                                base64: base64String,
                                mimeType: blob.type,
                                originalSize,
                                compressedSize,
                                compressionRatio,
                                format: blob.type.split('/')[1] || format,
                            });
                        };
                        reader2.readAsDataURL(blob);
                    },
                    `image/${format}`,
                    quality
                );
            };
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            img.src = e.target?.result as string;
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Compresses multiple images
 * @param files Array of image files
 * @param options Compression options (applied to all files)
 * @returns Promise with array of compressed images
 */
export async function compressMultipleImages(
    files: File[],
    options?: IImageCompressionOptions
): Promise<ICompressedImage[]> {
    return Promise.all(files.map((file) => compressImage(file, options)));
}

/**
 * Converts base64 string back to File object
 * @param base64String The base64 string
 * @param filename The filename for the new File
 * @param mimeType The MIME type of the file
 * @returns File object
 */
export function base64ToFile(
    base64String: string,
    filename: string,
    mimeType: string = 'image/webp'
): File {
    const arr = base64String.split(',');
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);

    for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
    }

    return new File([u8arr], filename, { type: mimeType });
}

/**
 * Checks if WebP format is supported by the browser
 * @returns Promise<boolean> true if WebP is supported
 */
export async function isWebPSupported(): Promise<boolean> {
    return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            resolve(webP.height === 2);
        };
        webP.src =
            'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADwAQCdASoBAAEALmkAgA==';
    });
}

/**
 * Gets the best format based on browser support
 * @returns The recommended image format
 */
export async function getBestImageFormat(): Promise<'webp' | 'jpeg'> {
    const supported = await isWebPSupported();
    return supported ? 'webp' : 'jpeg';
}

/**
 * Validates if a file is an image
 * @param file File to validate
 * @returns boolean true if file is a valid image
 */
export function isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type) && file.size > 0;
}

/**
 * Formats file size for display
 * @param bytes Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
