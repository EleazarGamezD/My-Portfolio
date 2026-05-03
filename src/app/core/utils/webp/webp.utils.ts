/**
 * Converts a base64 image to a WebP image.
 *
 * @param {string} base64 - The base64 encoded image.
 * @returns {Promise<string>} - A promise that resolves with the WebP image as a base64 string.
 */
export async function convertToWebP(base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const webpBase64 = canvas.toDataURL('image/webp', 0.8);
        resolve(webpBase64);
      } else {
        reject(new Error('No se pudo obtener el contexto del canvas'));
      }
    };
    img.onerror = (error) => reject(error);
  });
}
